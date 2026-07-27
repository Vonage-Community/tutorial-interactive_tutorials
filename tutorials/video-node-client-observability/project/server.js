import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  correlateSupportCase,
  findSustainedIssues,
  normalizeTelemetry,
  summarizeSession
} from "./src/monitoring.js";
import {
  platformSession,
  scenarios,
  supportReport
} from "./src/fixtures.js";
import { getExerciseStatus } from "./src/exercise-validation.js";
import { TelemetryStore } from "./src/telemetry-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const GUIDE_PORT = 1234;

const app = express();
const store = new TelemetryStore();

app.use(express.json({ limit: "250kb" }));

app.get("/workspace/status", (_req, res) => {
  res.json({
    server: "video-node-client-observability",
    configured: true,
    appUrl: getPortUrl(PORT),
    guideUrl: getPortUrl(GUIDE_PORT),
    missing_credentials: false
  });
});

app.get("/api/scenarios", (_req, res) => {
  res.json(
    Object.values(scenarios).map(({ id, name, description, records }) => ({
      id,
      name,
      description,
      sampleCount: records.length
    }))
  );
});

app.post("/api/scenarios/:scenarioId", (req, res) => {
  const scenario = scenarios[req.params.scenarioId];
  if (!scenario) {
    res.status(404).json({ error: "Unknown scenario." });
    return;
  }

  try {
    const records = scenario.records.map((record, index) =>
      normalizeTelemetry(
        record,
        new Date(Date.parse(record.capturedAt) + 500 + index).toISOString()
      )
    );
    store.addMany(records);
    res.status(201).json({
      scenarioId: scenario.id,
      accepted: records.length,
      dashboard: buildDashboard()
    });
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.post("/api/reset", (_req, res) => {
  store.clear();
  res.status(204).end();
});

app.get("/api/dashboard", (_req, res) => {
  res.json(buildDashboard());
});

app.get("/api/support-case", (_req, res) => {
  res.json({
    report: supportReport,
    evidence: correlateSupportCase(
      store.all(),
      supportReport,
      platformSession
    )
  });
});

app.get("/api/exercise/status", (_req, res) => {
  res.json(getExerciseStatus());
});

app.get(["/guide", "/guide/"], (_req, res) => {
  res.redirect(getPortUrl(GUIDE_PORT));
});

app.use(express.static(path.join(__dirname, "public")));

makeCodespacePortPublic(PORT);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Video quality monitor: ${getPortUrl(PORT)}`);
  console.log(`Interactive guide: ${getPortUrl(GUIDE_PORT)}`);
  console.log("Server is running. Leave this terminal open.");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use.`);
    process.exit(0);
  }
  throw error;
});

function buildDashboard() {
  const records = store.all();
  const grouped = Map.groupBy
    ? Map.groupBy(records, (record) => record.sessionId)
    : groupBySession(records);
  const sessions = [...grouped.values()].map((sessionRecords) =>
    summarizeSession(sessionRecords)
  );

  return {
    recordCount: records.length,
    sessions,
    alerts: findSustainedIssues(records),
    recentRecords: records.slice(-8).reverse()
  };
}

function groupBySession(records) {
  const grouped = new Map();
  for (const record of records) {
    const current = grouped.get(record.sessionId) ?? [];
    current.push(record);
    grouped.set(record.sessionId, current);
  }
  return grouped;
}

function getPortUrl(port) {
  if (process.env.CODESPACE_NAME) {
    return `https://${process.env.CODESPACE_NAME}-${port}.app.github.dev`;
  }
  return `http://localhost:${port}`;
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
