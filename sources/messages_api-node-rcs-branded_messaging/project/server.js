const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { URLSearchParams } = require("node:url");
const { Vonage } = require("@vonage/server-sdk");
const { Channels } = require("@vonage/messages");

const PORT = 3000;
const sentMessages = [];
const statusEvents = [];
let lastError = null;

function readEnv() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  return fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .reduce((env, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        return env;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      env[key] = value;
      return env;
    }, {});
}

function normalizeMessagesApiHost(value) {
  return (value || "https://api.nexmo.com")
    .trim()
    .replace(/\/v1\/messages\/?$/, "")
    .replace(/\/$/, "");
}

function getConfig() {
  const env = { ...process.env, ...readEnv() };
  const privateKeyPath = env.VONAGE_PRIVATE_KEY_PATH || "./private.key";
  const resolvedPrivateKeyPath = path.resolve(process.cwd(), privateKeyPath);
  const privateKey = fs.existsSync(resolvedPrivateKeyPath)
    ? fs.readFileSync(resolvedPrivateKeyPath, "utf8")
    : "";

  return {
    applicationId: env.VONAGE_APPLICATION_ID || "",
    privateKey,
    privateKeyPath,
    rcsSenderId: env.RCS_SENDER_ID || "",
    toNumber: env.RCS_TO_NUMBER || "",
    messagesApiHost: normalizeMessagesApiHost(env.MESSAGES_API_HOST || env.MESSAGES_API_URL),
    defaultText: env.DEFAULT_RCS_TEXT || "Hello from Vonage RCS"
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
  return Boolean(
    config.applicationId
    && config.privateKey
    && config.rcsSenderId
    && config.toNumber
  );
}

function canReadPrivateKey(config) {
  if (!config.privateKey) {
    return false;
  }

  try {
    crypto.createPrivateKey(config.privateKey);
    return true;
  } catch {
    return false;
  }
}

function canInitializeMessagesClient(config) {
  if (!hasCompleteConfig(config) || !canReadPrivateKey(config)) {
    return false;
  }

  try {
    initializeMessagesClient(config);
    return true;
  } catch {
    return false;
  }
}

function initializeMessagesClient(config) {
  // TODO: Initialize the SDK client
  throw new Error("initializeMessagesClient() is not complete yet.");
}

function buildRcsTextPayload(config, text, baseUrl) {
  // TODO: Build the RCS text payload
  throw new Error("buildRcsTextPayload() is not complete yet.");
}

async function sendRcsText(config, text, baseUrl) {
  // TODO: Send the RCS request
  throw new Error("sendRcsText() is not complete yet.");
}

function normalizeStatusEvent(rawEvent) {
  return {
    messageUuid: rawEvent.message_uuid || rawEvent.messageUuid || "unknown",
    status: rawEvent.status || rawEvent.message_status || "unknown",
    channel: rawEvent.channel || "unknown",
    from: rawEvent.from || "unknown",
    to: rawEvent.to || "unknown",
    timestamp: rawEvent.timestamp || new Date().toISOString(),
    raw: rawEvent
  };
}

function recordStatusEvent(rawEvent) {
  // TODO: Store status webhook events
  throw new Error("recordStatusEvent() is not complete yet.");
}

function getMatchingStatusEvent() {
  return statusEvents.find((event) =>
    sentMessages.some((message) => message.messageUuid === event.messageUuid)
  );
}

function buildValidationUrl(baseUrl) {
  const event = getMatchingStatusEvent();

  if (!event) {
    return null;
  }

  const query = new URLSearchParams({
    message_uuid: event.messageUuid,
    status: event.status
  });

  return `${baseUrl}/validate?${query.toString()}`;
}

function getChecks(config) {
  return [
    {
      label: "Required RCS values are present",
      passed: hasCompleteConfig(config)
    },
    {
      label: "Private key can be read",
      passed: canReadPrivateKey(config)
    },
    {
      label: "Messages API SDK client can be initialized",
      passed: canInitializeMessagesClient(config)
    },
    {
      label: "Messages API accepted an RCS request",
      passed: sentMessages.length > 0
    },
    {
      label: "A status webhook was received",
      passed: statusEvents.length > 0
    },
    {
      label: "A status event matches the sent message",
      passed: Boolean(getMatchingStatusEvent())
    }
  ];
}

async function readErrorBody(error) {
  if (!error.response || typeof error.response.text !== "function") {
    return "";
  }

  try {
    const response = typeof error.response.clone === "function"
      ? error.response.clone()
      : error.response;
    return await response.text();
  } catch {
    return "";
  }
}

async function formatError(error) {
  const status = error.response?.status;
  const body = await readErrorBody(error);

  if (status) {
    const prefix = status === 401
      ? "Messages API returned 401 Unauthorized. Check that the Application ID and private key belong to the Vonage Application connected to this RCS Sender ID."
      : `Messages API returned ${status}.`;
    return body ? `${prefix}\n\n${body}` : prefix;
  }

  return error.stack || error.message || String(error);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderPage(req) {
  const config = getConfig();
  const baseUrl = getBaseUrl(req);
  const validationUrl = buildValidationUrl(baseUrl);
  const checks = getChecks(config);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>RCS Message App</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f8fb;
        --panel: #ffffff;
        --text: #111827;
        --muted: #4b5563;
        --border: #d9dee8;
        --ok: #087443;
        --warn: #9a3412;
        --accent: #0055ff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--text);
      }

      main {
        width: min(1080px, calc(100vw - 32px));
        margin: 32px auto;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 2rem;
        line-height: 1.2;
      }

      h2 {
        margin: 0 0 16px;
        font-size: 1.15rem;
      }

      p {
        color: var(--muted);
        line-height: 1.55;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
        gap: 16px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        margin-top: 16px;
        padding: 20px;
      }

      .checks {
        display: grid;
        gap: 8px;
        margin: 16px 0 0;
        padding: 0;
        list-style: none;
      }

      .check {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--warn);
        flex: 0 0 auto;
      }

      .check.ok .dot {
        background: var(--ok);
      }

      label {
        display: block;
        margin: 0 0 8px;
        font-weight: 650;
      }

      textarea {
        width: 100%;
        min-height: 108px;
        resize: vertical;
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 12px;
        font: inherit;
      }

      button {
        margin-top: 12px;
        border: 0;
        border-radius: 6px;
        background: var(--accent);
        color: white;
        font: inherit;
        font-weight: 650;
        padding: 10px 14px;
        cursor: pointer;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.92rem;
      }

      th,
      td {
        border-bottom: 1px solid var(--border);
        padding: 10px 8px;
        text-align: left;
        vertical-align: top;
      }

      code,
      pre {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }

      pre {
        overflow: auto;
        padding: 12px;
        border-radius: 6px;
        background: #111827;
        color: #f9fafb;
      }

      .error {
        border-color: #fca5a5;
        background: #fff1f2;
        color: #7f1d1d;
      }

      .success {
        border-color: #86efac;
        background: #f0fdf4;
      }

      @media (max-width: 820px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>RCS Message App</h1>
      <p>Send a basic RCS text message with the Vonage Messages API and review the status events returned to this Codespace.</p>

      <div class="grid">
        <section class="panel">
          <h2>Implementation checks</h2>
          <ul class="checks">
            ${checks.map((check) => `
              <li class="check ${check.passed ? "ok" : ""}">
                <span class="dot"></span>
                <span>${escapeHtml(check.label)}</span>
              </li>
            `).join("")}
          </ul>
        </section>

        <section class="panel">
          <h2>Configured sender</h2>
          <p><strong>Application:</strong> ${escapeHtml(config.applicationId || "Not configured")}</p>
          <p><strong>RCS Sender ID:</strong> ${escapeHtml(config.rcsSenderId || "Not configured")}</p>
          <p><strong>Recipient:</strong> ${escapeHtml(config.toNumber || "Not configured")}</p>
          <p><strong>Messages API host:</strong> ${escapeHtml(config.messagesApiHost)}</p>
          <p><strong>Status webhook:</strong><br><code>${escapeHtml(`${baseUrl}/webhooks/status`)}</code></p>
        </section>
      </div>

      ${lastError ? `<section class="panel error"><strong>Last error:</strong><pre>${escapeHtml(lastError)}</pre></section>` : ""}

      <section class="panel">
        <h2>Send an RCS text message</h2>
        <form method="post" action="/send">
          <label for="text">Message text</label>
          <textarea id="text" name="text">${escapeHtml(config.defaultText)}</textarea>
          <button type="submit">Send RCS message</button>
        </form>
      </section>

      ${validationUrl ? `
        <section class="panel success">
          <h2>Learning Path validation URL</h2>
          <p>Copy this complete URL into the Completed exercise credentials field in your learning path.</p>
          <pre>${escapeHtml(validationUrl)}</pre>
        </section>
      ` : ""}

      <section class="panel">
        <h2>Sent messages</h2>
        ${sentMessages.length ? `
          <table>
            <thead>
              <tr>
                <th>Message UUID</th>
                <th>To</th>
                <th>Sent at</th>
              </tr>
            </thead>
            <tbody>
              ${sentMessages.map((message) => `
                <tr>
                  <td><code>${escapeHtml(message.messageUuid)}</code></td>
                  <td>${escapeHtml(message.to)}</td>
                  <td>${escapeHtml(message.sentAt)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : "<p>No messages sent yet.</p>"}
      </section>

      <section class="panel">
        <h2>Status events</h2>
        ${statusEvents.length ? `
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Message UUID</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${statusEvents.map((event) => `
                <tr>
                  <td>${escapeHtml(event.status)}</td>
                  <td><code>${escapeHtml(event.messageUuid)}</code></td>
                  <td>${escapeHtml(event.timestamp)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : "<p>No status events received yet.</p>"}
      </section>
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

      if (!raw) {
        resolve({});
        return;
      }

      try {
        if (contentType.includes("application/json")) {
          resolve(JSON.parse(raw));
          return;
        }

        if (contentType.includes("application/x-www-form-urlencoded")) {
          resolve(Object.fromEntries(new URLSearchParams(raw)));
          return;
        }

        resolve({ raw });
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function redirect(res, location = "/") {
  res.writeHead(303, { Location: location });
  res.end();
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage(req));
      return;
    }

    if (req.method === "GET" && req.url.startsWith("/validate")) {
      const validationUrl = buildValidationUrl(getBaseUrl(req));
      res.writeHead(validationUrl ? 200 : 404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ validationUrl }));
      return;
    }

    if (req.method === "POST" && req.url === "/send") {
      const body = await parseBody(req);
      const config = getConfig();

      if (!hasCompleteConfig(config)) {
        throw new Error("Run npm run setup before sending an RCS message.");
      }

      await sendRcsText(config, body.text || config.defaultText, getBaseUrl(req));
      lastError = null;
      redirect(res);
      return;
    }

    if (req.method === "POST" && req.url === "/webhooks/status") {
      const body = await parseBody(req);
      const event = recordStatusEvent(body);
      console.log("Status event received:", event);
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    lastError = await formatError(error);
    console.error(lastError);

    if (!res.headersSent) {
      if (req.method === "POST") {
        redirect(res);
      } else {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(error.message);
      }
    }
  }
});

server.listen(PORT, () => {
  console.log(`RCS message app listening on port ${PORT}`);
});
