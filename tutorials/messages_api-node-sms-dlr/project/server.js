const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { URLSearchParams } = require("node:url");
const { Vonage } = require("@vonage/server-sdk");
const { Channels } = require("@vonage/messages");

const PORT = Number(process.env.PORT || 3000);
const sentMessages = [];
const statusEvents = [];
let lastError = null;

function readEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, "utf8").split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .reduce((env, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return env;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      env[key] = value;
      return env;
    }, {});
}

function getConfig() {
  const env = { ...process.env, ...readEnv() };
  const privateKeyPath = env.VONAGE_PRIVATE_KEY_PATH || "./private.key";
  const resolvedPrivateKeyPath = path.resolve(process.cwd(), privateKeyPath);

  return {
    applicationId: env.VONAGE_APPLICATION_ID || "",
    privateKey: fs.existsSync(resolvedPrivateKeyPath) ? fs.readFileSync(resolvedPrivateKeyPath, "utf8") : "",
    fromNumber: env.SMS_FROM_NUMBER || "",
    toNumber: env.SMS_TO_NUMBER || "",
    messagesApiHost: (env.MESSAGES_API_HOST || "https://api.nexmo.com").replace(/\/$/, ""),
    defaultText: env.DEFAULT_SMS_TEXT || "Track this SMS with a status callback"
  };
}

function getBaseUrl(req) {
  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    return `https://${process.env.CODESPACE_NAME}-${PORT}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  }
  const host = req.headers.host || `localhost:${PORT}`;
  const protocol = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

function hasCompleteConfig(config) {
  return Boolean(config.applicationId && config.privateKey && config.fromNumber && config.toNumber);
}

function canReadPrivateKey(config) {
  if (!config.privateKey) return false;
  try {
    crypto.createPrivateKey(config.privateKey);
    return true;
  } catch {
    return false;
  }
}

function initializeMessagesClient(config) {
  // TODO: Initialize the SDK client
  throw new Error("initializeMessagesClient() is not complete yet.");
}

function buildSmsPayload(config, text) {
  // TODO: Build the SMS request
  throw new Error("buildSmsPayload() is not complete yet.");
}

async function sendSms(config, text) {
  // TODO: Send the SMS
  throw new Error("sendSms() is not complete yet.");
}

function normalizeStatusEvent(rawEvent) {
  return {
    messageUuid: rawEvent.message_uuid || rawEvent.messageUuid || "unknown",
    status: rawEvent.status || "unknown",
    channel: rawEvent.channel || "unknown",
    from: rawEvent.from || "unknown",
    to: rawEvent.to || "unknown",
    timestamp: rawEvent.timestamp || new Date().toISOString(),
    raw: rawEvent
  };
}

function recordStatusEvent(rawEvent) {
  // TODO: Store the status callback
  throw new Error("recordStatusEvent() is not complete yet.");
}

function canInitializeMessagesClient(config) {
  if (!hasCompleteConfig(config) || !canReadPrivateKey(config)) return false;
  try {
    initializeMessagesClient(config);
    return true;
  } catch {
    return false;
  }
}

function getMatchingStatusEvent() {
  return statusEvents.find((event) => sentMessages.some((message) => message.messageUuid === event.messageUuid));
}

function getChecks(config) {
  return [
    { label: "Required SMS values are present", passed: hasCompleteConfig(config) },
    { label: "Private key can be read", passed: canReadPrivateKey(config) },
    { label: "Messages API SDK client can be initialized", passed: canInitializeMessagesClient(config) },
    { label: "Messages API accepted an SMS request", passed: sentMessages.length > 0 },
    { label: "A status callback was received", passed: statusEvents.length > 0 },
    { label: "A status callback matches the sent SMS", passed: Boolean(getMatchingStatusEvent()) }
  ];
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function readErrorBody(error) {
  if (!error.response || typeof error.response.text !== "function") return "";
  try {
    const response = typeof error.response.clone === "function" ? error.response.clone() : error.response;
    return await response.text();
  } catch {
    return "";
  }
}

async function formatError(error) {
  const status = error.response?.status;
  const body = await readErrorBody(error);
  if (status) return body ? `Messages API returned ${status}.\n\n${body}` : `Messages API returned ${status}.`;
  return error.stack || error.message || String(error);
}

function renderPage(req) {
  const config = getConfig();
  const baseUrl = getBaseUrl(req);
  const checks = getChecks(config);
  const matchingEvent = getMatchingStatusEvent();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SMS Status Monitor</title>
  <style>
    :root { color-scheme:light; --bg:#f7f8fb; --panel:#fff; --text:#111827; --muted:#4b5563; --border:#d9dee8; --ok:#087443; --warn:#9a3412; --accent:#0055ff; }
    * { box-sizing:border-box; } body { margin:0; font-family:Inter,ui-sans-serif,system-ui,sans-serif; background:var(--bg); color:var(--text); }
    main { width:min(1080px,calc(100vw - 32px)); margin:32px auto; } h1 { margin:0 0 8px; font-size:2rem; } h2 { margin:0 0 16px; font-size:1.15rem; }
    p { color:var(--muted); line-height:1.55; } .grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,420px); gap:16px; }
    .panel { background:var(--panel); border:1px solid var(--border); border-radius:8px; margin-top:16px; padding:20px; }
    .checks { display:grid; gap:8px; margin:0; padding:0; list-style:none; } .check { display:flex; align-items:center; gap:8px; color:var(--muted); }
    .dot { width:10px; height:10px; border-radius:50%; background:var(--warn); flex:0 0 auto; } .check.ok .dot { background:var(--ok); }
    label { display:block; margin-bottom:8px; font-weight:650; } textarea { width:100%; min-height:100px; resize:vertical; border:1px solid var(--border); border-radius:6px; padding:12px; font:inherit; }
    button { border:0; border-radius:6px; background:var(--accent); color:#fff; font:inherit; font-weight:650; padding:10px 14px; cursor:pointer; } form button { margin-top:12px; }
    table { width:100%; border-collapse:collapse; font-size:.92rem; } th,td { border-bottom:1px solid var(--border); padding:10px 8px; text-align:left; vertical-align:top; }
    code,pre { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; } pre { overflow:auto; padding:12px; border-radius:6px; background:#111827; color:#f9fafb; }
    .error { border-color:#fca5a5; background:#fff1f2; color:#7f1d1d; } .success { border-color:#86efac; background:#f0fdf4; }
    .completion { display:flex; gap:12px; align-items:center; flex-wrap:wrap; } .completion code,.webhook { overflow-wrap:anywhere; }
    @media (max-width:820px) { .grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>SMS Status Monitor</h1>
    <p>Send an SMS through the Messages API and match the returned message UUID to an incoming status callback.</p>
    <div class="grid">
      <section class="panel"><h2>Implementation checks</h2><ul class="checks">
        ${checks.map((check) => `<li class="check ${check.passed ? "ok" : ""}"><span class="dot"></span><span>${escapeHtml(check.label)}</span></li>`).join("")}
      </ul></section>
      <section class="panel"><h2>Webhook configuration</h2>
        <p><strong>Application:</strong> ${escapeHtml(config.applicationId || "Not configured")}</p>
        <p><strong>Status webhook URL:</strong><br><code class="webhook">${escapeHtml(`${baseUrl}/webhooks/status`)}</code></p>
      </section>
    </div>
    ${lastError ? `<section class="panel error"><strong>Last error</strong><pre>${escapeHtml(lastError)}</pre></section>` : ""}
    <section class="panel"><h2>Send a test SMS</h2><form method="post" action="/send">
      <label for="text">Message text</label><textarea id="text" name="text" maxlength="160">${escapeHtml(config.defaultText)}</textarea><button type="submit">Send test SMS</button>
    </form></section>
    ${matchingEvent ? `<section class="panel success"><h2>Completed exercise credentials</h2>
      <p>Copy this message UUID into the Completed exercise credentials field in your learning path.</p>
      <div class="completion"><code id="completion-value">${escapeHtml(matchingEvent.messageUuid)}</code>
      <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('completion-value').textContent)">Copy</button></div>
    </section>` : ""}
    <section class="panel"><h2>Sent messages</h2>${sentMessages.length ? `<table><thead><tr><th>Message UUID</th><th>To</th><th>Sent at</th></tr></thead><tbody>
      ${sentMessages.map((message) => `<tr><td><code>${escapeHtml(message.messageUuid)}</code></td><td>${escapeHtml(message.to)}</td><td>${escapeHtml(message.sentAt)}</td></tr>`).join("")}
      </tbody></table>` : "<p>No messages sent yet.</p>"}</section>
    <section class="panel"><h2>Status events</h2><button type="button" onclick="location.reload()">Refresh status events</button>
      ${statusEvents.length ? `<table><thead><tr><th>Status</th><th>Message UUID</th><th>Timestamp</th></tr></thead><tbody>
      ${statusEvents.map((event) => `<tr><td>${escapeHtml(event.status)}</td><td><code>${escapeHtml(event.messageUuid)}</code></td><td>${escapeHtml(event.timestamp)}</td></tr>`).join("")}
      </tbody></table>` : "<p>No status events received yet.</p>"}</section>
  </main>
</body>
</html>`;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      const contentType = req.headers["content-type"] || "";
      try {
        if (!raw) return resolve({});
        if (contentType.includes("application/json")) return resolve(JSON.parse(raw));
        resolve(Object.fromEntries(new URLSearchParams(raw)));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function redirect(res) {
  res.writeHead(303, { Location: "/" });
  res.end();
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage(req));
      return;
    }

    if (req.method === "POST" && req.url === "/webhooks/status") {
      const body = await parseBody(req);
      try {
        const event = recordStatusEvent(body);
        console.log("Status callback received:", event);
        lastError = null;
      } catch (error) {
        lastError = error.stack || error.message || String(error);
        console.error(lastError);
      }
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "POST" && req.url === "/send") {
      const config = getConfig();
      if (!hasCompleteConfig(config)) throw new Error("Run npm run setup before sending an SMS.");
      const body = await parseBody(req);
      await sendSms(config, body.text || config.defaultText);
      lastError = null;
      redirect(res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    lastError = await formatError(error);
    console.error(lastError);
    redirect(res);
  }
});

server.listen(PORT, () => console.log(`SMS Status Monitor listening on port ${PORT}`));
