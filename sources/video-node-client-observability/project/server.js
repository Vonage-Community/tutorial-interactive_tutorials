import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { MediaMode, Video } from "@vonage/video";
import {
  correlateSupportCase,
  findSustainedIssues,
  normalizeTelemetry,
  summarizeSession
} from "./src/monitoring.js";
import { getExerciseStatus } from "./src/exercise-validation.js";
import { TelemetryStore } from "./src/telemetry-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || process.env.NERU_APP_PORT || 3000);
const GUIDE_PORT = 1234;
const ENV_PATH = path.join(__dirname, ".env");

const app = express();
const store = new TelemetryStore();
const runtime = createRuntime();
const state = {
  liveSessionId: null,
  callbackEvents: [],
  supportReport: null
};

app.use(express.json({ limit: "500kb" }));

app.get("/workspace/status", (_req, res) => {
  res.json(runtime.workspaceStatus());
});

app.post("/api/session", async (_req, res) => {
  const video = getVideoClient();
  if (!video) {
    res.status(503).json({
      error: "missing_credentials",
      message: "Run npm run setup-credentials first."
    });
    return;
  }

  try {
    const session = await video.createSession({ mediaMode: MediaMode.ROUTED });
    state.liveSessionId = session.sessionId;
    state.supportReport = null;
    store.clear();

    res.status(201).json({
      applicationId: runtime.getEnv("VONAGE_APPLICATION_ID"),
      sessionId: session.sessionId,
      publisherToken: video.generateClientToken(session.sessionId, {
        role: "publisher"
      }),
      subscriberToken: video.generateClientToken(session.sessionId, {
        role: "subscriber"
      })
    });
  } catch (error) {
    res.status(500).json({
      error: "session_create_failed",
      message: error.message
    });
  }
});

app.post("/api/telemetry", (req, res) => {
  if (!state.liveSessionId || req.body?.sessionId !== state.liveSessionId) {
    res.status(409).json({
      error: "session_mismatch",
      message: "Start a new session before sending telemetry."
    });
    return;
  }

  try {
    const record = normalizeTelemetry(req.body);
    if (!record || typeof record !== "object") {
      throw new TypeError("normalizeTelemetry must return a telemetry record.");
    }
    store.add(record);
    res.status(201).json({ accepted: true });
  } catch (error) {
    res.status(422).json({
      error: "invalid_telemetry",
      message: error.message
    });
  }
});

app.post("/api/support-case", (_req, res) => {
  const records = store
    .all()
    .filter(
      (record) =>
        record.sessionId === state.liveSessionId &&
        record.source === "subscriber"
    )
    .sort(compareRecords);

  if (records.length === 0) {
    res.status(409).json({
      error: "missing_telemetry",
      message: "Collect subscriber telemetry before creating a support case."
    });
    return;
  }

  const first = Date.parse(records[0].capturedAt);
  const last = Date.parse(records.at(-1).capturedAt);
  state.supportReport = {
    caseId: `SUP-${String(Date.now()).slice(-6)}`,
    sessionId: state.liveSessionId,
    participantId: records[0].participantId,
    from: new Date(first - 1000).toISOString(),
    to: new Date(last + 1000).toISOString(),
    summary: "Review the subscriber telemetry collected during this session."
  };

  res.status(201).json(buildSupportCase());
});

app.get("/api/dashboard", (_req, res) => {
  res.json(buildDashboard());
});

app.get("/api/exercise/status", (_req, res) => {
  const workspace = runtime.workspaceStatus();
  res.json(
    getExerciseStatus({
      appUrl: workspace.appUrl,
      configured: workspace.configured,
      liveSessionId: state.liveSessionId,
      liveRecords: store.all()
    })
  );
});

app.post("/callbacks/video", (req, res) => {
  state.callbackEvents.push({
    receivedAt: new Date().toISOString(),
    type: req.body?.type || req.body?.event || "video-event",
    sessionId: req.body?.session_id || req.body?.sessionId || null
  });
  state.callbackEvents.splice(0, Math.max(0, state.callbackEvents.length - 100));
  res.sendStatus(204);
});

app.get(["/guide", "/guide/"], (_req, res) => {
  res.redirect(runtime.workspaceStatus().guideUrl);
});

app.use(express.static(path.join(__dirname, "public")));

makeCodespacePortPublic(PORT);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Video quality monitor: ${runtime.getAppUrl()}`);
  console.log(`Learning Center validation URL: ${runtime.getAppUrl()}`);
  console.log(`Interactive guide: ${getPortUrl(GUIDE_PORT)}`);
  console.log("Server is running. Leave this terminal open.");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(
      `Port ${PORT} is already in use. Keep using the running app, or stop it before restarting.`
    );
    process.exit(0);
  }
  throw error;
});

function getVideoClient() {
  const applicationId = runtime.getEnv("VONAGE_APPLICATION_ID");
  const privateKey = runtime.readPrivateKey();
  return applicationId && privateKey
    ? new Video({ applicationId, privateKey })
    : null;
}

function buildDashboard() {
  const records = store.all();
  const grouped = groupBy(records, (record) => record.sessionId);
  const sessions = [...grouped.values()]
    .map((sessionRecords) => summarizeSession(sessionRecords))
    .filter(Boolean);

  return {
    applicationId: runtime.getEnv("VONAGE_APPLICATION_ID") || null,
    sessionId: state.liveSessionId,
    callbackCount: state.callbackEvents.filter(
      (event) => event.sessionId === state.liveSessionId
    ).length,
    recordCount: records.length,
    sessions,
    alerts: findSustainedIssues(records) ?? [],
    recentRecords: records.slice(-12).reverse(),
    supportCase: buildSupportCase()
  };
}

function buildSupportCase() {
  if (!state.supportReport) {
    return null;
  }

  return {
    report: state.supportReport,
    evidence: correlateSupportCase(store.all(), state.supportReport)
  };
}

function groupBy(values, getKey) {
  const grouped = new Map();
  for (const value of values) {
    const key = getKey(value);
    const group = grouped.get(key) ?? [];
    group.push(value);
    grouped.set(key, group);
  }
  return grouped;
}

function compareRecords(left, right) {
  return Date.parse(left.capturedAt) - Date.parse(right.capturedAt);
}

function createRuntime() {
  let envMtimeMs = null;

  function reloadRuntimeEnv() {
    try {
      const stat = fs.statSync(ENV_PATH);
      if (envMtimeMs === stat.mtimeMs) {
        return;
      }

      const parsed = parseEnvFile(fs.readFileSync(ENV_PATH, "utf8"));
      for (const [key, value] of Object.entries(parsed)) {
        process.env[key] = value;
      }
      envMtimeMs = stat.mtimeMs;
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Failed to reload .env:", error.message);
      }
    }
  }

  function getEnv(name) {
    reloadRuntimeEnv();
    return process.env[name];
  }

  function readPrivateKey() {
    const privateKey64 = getEnv("VONAGE_PRIVATE_KEY64");
    if (privateKey64) {
      return Buffer.from(privateKey64, "base64").toString("utf8");
    }

    const privateKey = getEnv("VONAGE_PRIVATE_KEY");
    return privateKey ? privateKey.replace(/\\n/g, "\n") : null;
  }

  function getAppUrl() {
    const configured = getEnv("APP_URL");
    return configured ? configured.replace(/\/$/, "") : getPortUrl(PORT);
  }

  function workspaceStatus() {
    const configured = Boolean(getEnv("VONAGE_APPLICATION_ID") && readPrivateKey());
    return {
      server: "video-node-client-observability",
      configured,
      appUrl: getAppUrl(),
      guideUrl: getPortUrl(GUIDE_PORT),
      missing_credentials: !configured
    };
  }

  return {
    getAppUrl,
    getEnv,
    readPrivateKey,
    workspaceStatus
  };
}

function getPortUrl(port) {
  if (process.env.CODESPACE_NAME) {
    return `https://${process.env.CODESPACE_NAME}-${port}.app.github.dev`;
  }
  return `http://localhost:${port}`;
}

function parseEnvFile(content) {
  const result = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    result[key] = unquoteEnvValue(rawValue);
  }

  return result;
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    const unquoted = value.slice(1, -1);
    return value.startsWith('"')
      ? unquoted.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      : unquoted;
  }

  return value;
}

function makeCodespacePortPublic(port) {
  if (!process.env.CODESPACE_NAME) {
    return;
  }

  spawnSync(
    "gh",
    [
      "codespace",
      "ports",
      "visibility",
      `${port}:public`,
      "-c",
      process.env.CODESPACE_NAME
    ],
    { stdio: "ignore" }
  );
}
