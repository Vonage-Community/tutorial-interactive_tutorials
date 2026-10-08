const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { URLSearchParams } = require("node:url");
const { Vonage } = require("@vonage/server-sdk");
const { Channels } = require("@vonage/messages");

const PORT = Number(process.env.PORT || 3000);
let lastSentMessage = null;
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
    defaultText: env.DEFAULT_SMS_TEXT || "Hello from the Vonage Messages API"
  };
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

function canInitializeMessagesClient(config) {
  if (!hasCompleteConfig(config) || !canReadPrivateKey(config)) return false;
  try {
    initializeMessagesClient(config);
    return true;
  } catch {
    return false;
  }
}

function getChecks(config) {
  return [
    { label: "Required SMS values are present", passed: hasCompleteConfig(config) },
    { label: "Private key can be read", passed: canReadPrivateKey(config) },
    { label: "Messages API SDK client can be initialized", passed: canInitializeMessagesClient(config) },
    { label: "Messages API accepted an SMS request", passed: Boolean(lastSentMessage) }
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

function renderPage() {
  const config = getConfig();
  const checks = getChecks(config);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SMS Message App</title>
  <style>
    :root { color-scheme: light; --bg:#f7f8fb; --panel:#fff; --text:#111827; --muted:#4b5563; --border:#d9dee8; --ok:#087443; --warn:#9a3412; --accent:#0055ff; }
    * { box-sizing:border-box; } body { margin:0; font-family:Inter,ui-sans-serif,system-ui,sans-serif; background:var(--bg); color:var(--text); }
    main { width:min(920px,calc(100vw - 32px)); margin:32px auto; } h1 { margin:0 0 8px; font-size:2rem; } h2 { margin:0 0 16px; font-size:1.15rem; }
    p { color:var(--muted); line-height:1.55; } .grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(300px,1fr); gap:16px; }
    .panel { background:var(--panel); border:1px solid var(--border); border-radius:8px; margin-top:16px; padding:20px; }
    .checks { display:grid; gap:8px; margin:0; padding:0; list-style:none; } .check { display:flex; align-items:center; gap:8px; color:var(--muted); }
    .dot { width:10px; height:10px; border-radius:50%; background:var(--warn); flex:0 0 auto; } .check.ok .dot { background:var(--ok); }
    label { display:block; margin-bottom:8px; font-weight:650; } textarea { width:100%; min-height:100px; resize:vertical; border:1px solid var(--border); border-radius:6px; padding:12px; font:inherit; }
    button { border:0; border-radius:6px; background:var(--accent); color:#fff; font:inherit; font-weight:650; padding:10px 14px; cursor:pointer; } form button { margin-top:12px; }
    code,pre { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; } pre { overflow:auto; padding:12px; border-radius:6px; background:#111827; color:#f9fafb; }
    .error { border-color:#fca5a5; background:#fff1f2; color:#7f1d1d; } .success { border-color:#86efac; background:#f0fdf4; }
    .completion { display:flex; gap:12px; align-items:center; flex-wrap:wrap; } .completion code { overflow-wrap:anywhere; }
    @media (max-width:720px) { .grid { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>SMS Message App</h1>
    <p>Send a text message with the Vonage Messages API and capture the message UUID returned by the API.</p>
    <div class="grid">
      <section class="panel"><h2>Implementation checks</h2><ul class="checks">
        ${checks.map((check) => `<li class="check ${check.passed ? "ok" : ""}"><span class="dot"></span><span>${escapeHtml(check.label)}</span></li>`).join("")}
      </ul></section>
      <section class="panel"><h2>SMS configuration</h2>
        <p><strong>Application:</strong> ${escapeHtml(config.applicationId || "Not configured")}</p>
        <p><strong>From:</strong> ${escapeHtml(config.fromNumber || "Not configured")}</p>
        <p><strong>To:</strong> ${escapeHtml(config.toNumber || "Not configured")}</p>
      </section>
    </div>
    ${lastError ? `<section class="panel error"><strong>Last error</strong><pre>${escapeHtml(lastError)}</pre></section>` : ""}
    <section class="panel"><h2>Send an SMS</h2><form method="post" action="/send">
      <label for="text">Message text</label><textarea id="text" name="text" maxlength="160">${escapeHtml(config.defaultText)}</textarea><button type="submit">Send SMS</button>
    </form></section>
    ${lastSentMessage ? `<section class="panel success"><h2>Completed exercise credentials</h2>
      <p>Copy this message UUID into the Completed exercise credentials field in your learning path.</p>
      <div class="completion"><code id="completion-value">${escapeHtml(lastSentMessage.messageUuid)}</code>
      <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('completion-value').textContent)">Copy</button></div>
    </section><section class="panel"><h2>Last accepted message</h2><p><strong>To:</strong> ${escapeHtml(lastSentMessage.to)}</p><p><strong>Sent at:</strong> ${escapeHtml(lastSentMessage.sentAt)}</p></section>` : ""}
  </main>
</body>
</html>`;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try { resolve(Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString("utf8")))); }
      catch (error) { reject(error); }
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
      res.end(renderPage());
      return;
    }

    if (req.method === "POST" && req.url === "/send") {
      const config = getConfig();
      if (!hasCompleteConfig(config)) throw new Error("Run npm run setup before sending an SMS.");
      const body = await parseBody(req);
      lastSentMessage = await sendSms(config, body.text || config.defaultText);
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

server.listen(PORT, () => console.log(`SMS Message App listening on port ${PORT}`));
