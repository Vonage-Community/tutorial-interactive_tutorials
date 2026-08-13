const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { URLSearchParams } = require("node:url");
const { Vonage } = require("@vonage/server-sdk");
const { Channels } = require("@vonage/messages");

const PORT = 3000;
const RICH_CARD_IMAGE_PATH = path.join(__dirname, "assets", "vonage-logo.png");
const sentMessages = [];
const statusEvents = [];
const inboundEvents = [];
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
      const value = line.slice(separatorIndex + 1).trim();
      env[key] = value;
      return env;
    }, {});
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
    toNumber: env.RCS_TO_NUMBER || ""
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
  // TODO: Initialize the Messages API SDK client
  throw new Error("initializeMessagesClient() is not complete yet.");
}

function buildRichCardPayload(config, baseUrl) {
  // TODO: Build the RCS rich card payload
  throw new Error("buildRichCardPayload() is not complete yet.");
}

async function sendRichCard(config, baseUrl) {
  // TODO: Send the rich card request
  throw new Error("sendRichCard() is not complete yet.");
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

function normalizeInboundEvent(rawEvent) {
  const reply = rawEvent.reply || {};
  const button = rawEvent.button || {};

  return {
    messageUuid: rawEvent.message_uuid || rawEvent.messageUuid || "unknown",
    messageType: rawEvent.message_type || rawEvent.messageType || "unknown",
    postbackData: reply.id || reply.payload || button.payload || button.id || rawEvent.id || "unknown",
    title: reply.title || button.title || rawEvent.text || "unknown",
    channel: rawEvent.channel || "unknown",
    from: rawEvent.from || "unknown",
    to: rawEvent.to || "unknown",
    timestamp: rawEvent.timestamp || new Date().toISOString(),
    raw: rawEvent
  };
}

function recordInboundEvent(rawEvent) {
  // TODO: Store inbound reply events
  throw new Error("recordInboundEvent() is not complete yet.");
}

function getMatchingStatusEvent() {
  return statusEvents.find((event) =>
    sentMessages.some((message) => message.messageUuid === event.messageUuid)
  );
}

function getLatestInboundEvent() {
  return inboundEvents.find((event) => event.postbackData !== "unknown");
}

function buildValidationUrl(baseUrl) {
  const statusEvent = getMatchingStatusEvent();
  const inboundEvent = getLatestInboundEvent();

  if (!statusEvent || !inboundEvent) {
    return null;
  }

  const query = new URLSearchParams({
    message_uuid: statusEvent.messageUuid,
    status: statusEvent.status,
    reply: inboundEvent.postbackData
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
      label: "A rich card image is available on this Codespace",
      passed: true
    },
    {
      label: "Messages API accepted an RCS rich card request",
      passed: sentMessages.length > 0
    },
    {
      label: "A status webhook was received",
      passed: statusEvents.length > 0
    },
    {
      label: "A status event matches the sent rich card",
      passed: Boolean(getMatchingStatusEvent())
    },
    {
      label: "A suggested reply was received by the inbound webhook",
      passed: Boolean(getLatestInboundEvent())
    }
  ];
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
    <title>RCS Rich Card App</title>
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

      img {
        display: block;
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 8px;
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
      <h1>RCS Rich Card App</h1>
      <p>Send an RCS rich card with the Vonage Messages API, then review the status and reply events returned to this Codespace.</p>

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
          <p><strong>Inbound webhook:</strong><br><code>${escapeHtml(`${baseUrl}/webhooks/inbound`)}</code></p>
          <p><strong>Status webhook:</strong><br><code>${escapeHtml(`${baseUrl}/webhooks/status`)}</code></p>
        </section>
      </div>

      ${lastError ? `<section class="panel error"><strong>Last error:</strong><pre>${escapeHtml(lastError)}</pre></section>` : ""}

      <section class="panel">
        <h2>Rich card preview</h2>
        <img src="/assets/vonage-logo.png" alt="Vonage logo">
        <p>The card uses this image through a public Codespace URL when you send the message.</p>
      </section>

      <section class="panel">
        <h2>Send the rich card</h2>
        <p>The prepared card includes an image and two suggested replies. Tap one of the replies on your RCS test device to send a postback to the inbound webhook.</p>
        <form method="post" action="/send">
          <button type="submit">Send RCS rich card</button>
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
        <h2>Sent rich cards</h2>
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
        ` : "<p>No rich cards sent yet.</p>"}
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

      <section class="panel">
        <h2>Inbound replies</h2>
        ${inboundEvents.length ? `
          <table>
            <thead>
              <tr>
                <th>Postback data</th>
                <th>Title</th>
                <th>From</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${inboundEvents.map((event) => `
                <tr>
                  <td><code>${escapeHtml(event.postbackData)}</code></td>
                  <td>${escapeHtml(event.title)}</td>
                  <td>${escapeHtml(event.from)}</td>
                  <td>${escapeHtml(event.timestamp)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : "<p>No inbound replies received yet.</p>"}
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

    if (req.method === "GET" && req.url === "/assets/vonage-logo.png") {
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Cache-Control": "no-store"
      });
      res.end(fs.readFileSync(RICH_CARD_IMAGE_PATH));
      return;
    }

    if (req.method === "GET" && req.url.startsWith("/validate")) {
      const validationUrl = buildValidationUrl(getBaseUrl(req));
      res.writeHead(validationUrl ? 200 : 404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ validationUrl }));
      return;
    }

    if (req.method === "POST" && req.url === "/send") {
      const config = getConfig();

      if (!hasCompleteConfig(config)) {
        throw new Error("Run npm run setup before sending an RCS rich card.");
      }

      await sendRichCard(config, getBaseUrl(req));
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

    if (req.method === "POST" && req.url === "/webhooks/inbound") {
      const body = await parseBody(req);
      const event = recordInboundEvent(body);
      console.log("Inbound reply received:", event);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    lastError = error.stack || error.message;
    console.error(error);

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
  console.log(`RCS rich card app listening on port ${PORT}`);
});
