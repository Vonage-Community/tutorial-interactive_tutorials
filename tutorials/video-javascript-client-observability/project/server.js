import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { getExerciseStatus } from "./src/exercise-validation.js";
import {
  getExerciseActivity,
  recordExerciseActivity
} from "./src/exercise-state.js";
import { registerVideoRoutes } from "./src/video-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || process.env.NERU_APP_PORT || 3000);
const GUIDE_PORT = 1234;
const ENV_PATH = path.join(__dirname, ".env");
const runtime = createRuntime();
const app = express();

app.use(express.json({ limit: "250kb" }));

app.get("/workspace/status", (_req, res) => {
  res.json(runtime.workspaceStatus());
});

app.get(["/guide", "/guide/"], (_req, res) => {
  res.redirect(runtime.workspaceStatus().guideUrl);
});

app.get("/api/exercise/status", async (_req, res) => {
  const workspace = runtime.workspaceStatus();
  res.json(await getExerciseStatus({
    appUrl: workspace.appUrl,
    configured: workspace.configured,
    activity: getExerciseActivity()
  }));
});

app.post("/api/exercise/activity", (req, res) => {
  if (!recordExerciseActivity(req.body ?? {})) {
    res.status(400).json({
      error: "invalid_activity",
      message: "The activity type and session ID are required."
    });
    return;
  }

  res.sendStatus(204);
});

registerVideoRoutes({ app, runtime });
app.use(express.static(path.join(__dirname, "public")));

makeCodespacePortPublic(PORT);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Client Observability app: ${runtime.getAppUrl()}`);
  console.log(`Learning Center validation URL: ${runtime.getAppUrl()}`);
  console.log("Server is running. Leave this terminal open.");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use. Keep using the running app, or stop it before restarting.`);
    process.exit(0);
  }
  throw error;
});

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
      server: "video-javascript-client-observability",
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

function makeCodespacePortPublic(portToExpose) {
  if (!process.env.CODESPACE_NAME) {
    return;
  }

  spawnSync(
    "gh",
    [
      "codespace",
      "ports",
      "visibility",
      `${portToExpose}:public`,
      "-c",
      process.env.CODESPACE_NAME
    ],
    { stdio: "ignore" }
  );
}
