---
title: Callback and Next Workflow
description: Add the /callback webhook that receives status updates from Vonage, the /next endpoint that forces SMS fallback, and configure the callback URL in the Vonage Dashboard.
---

Two more endpoints complete the backend:

- **`/callback`** — Vonage calls this webhook when verification status changes (e.g. Silent Auth completed, or the request expired)
- **`/next`** — the Android app calls this to skip Silent Auth and go straight to SMS, avoiding a ~20-second wait

---

## Add `POST /callback`

A **callback** (also called a webhook) is a URL in your backend that an external service calls to push notifications to you. Rather than your backend asking Vonage "has anything changed?" over and over, Vonage calls you when something happens.

Open `server.js` and add the `/callback` endpoint:

```js
app.post("/callback", async (req, res) => {
  try {
    const { request_id, status } = req.body || {};

    if (!request_id) {
      return res.status(400).json({ error: "Missing request_id" });
    }

    console.log("Callback received:", { request_id, status });

    const entry = verificationStore.get(request_id);
    if (!entry) {
      // Vonage may send callbacks for requests we don't have in memory
      // (e.g. after a server restart). Acknowledge and move on.
      console.warn("Callback for unknown request_id:", request_id);
      return res.status(200).json({ ok: true });
    }

    // Update status from the callback
    verificationStore.set(request_id, {
      ...entry,
      status: status || entry.status,
      updatedAt: new Date().toISOString(),
      lastEvent: req.body,
    });

    console.log(`Callback updated: ${request_id} -> ${status}`);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error processing callback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
```

### Why always return 200?

Vonage expects a `200` response from your callback. If it gets anything else — or no response — it retries the delivery. Retries are fine (the update is idempotent: setting the same status again is harmless), but returning a non-200 will cause Vonage to keep retrying unnecessarily.

---

## Add `POST /next`

The `/next` endpoint tells Vonage to skip the current workflow channel and move to the next one. In our case, that means skipping Silent Auth and sending an SMS immediately.

This is useful in the Android app when the Silent Auth request fails (bad network, SDK error, etc.) — instead of waiting ~20 seconds for Vonage to time out naturally, the app calls `/next` and the user gets an SMS right away.

```js
app.post("/next", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["requestId"]);
    if (missing) {
      return res.status(400).json({ error: `Field '${missing}' is required.` });
    }

    const { requestId } = req.body;

    const entry = verificationStore.get(requestId);
    if (!entry) {
      return res.status(404).json({ error: "Unknown request_id" });
    }

    console.log("Moving to next workflow (SMS) for:", requestId);

    const result = await verifyClient.nextWorkflow(requestId);
    console.log("Vonage nextWorkflow result:", result);

    verificationStore.set(requestId, {
      ...entry,
      updatedAt: new Date().toISOString(),
      lastEvent: { source: "next_workflow" },
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    const status = error?.response?.status || 500;
    const details = error?.response?.data || error?.message;

    console.error("Error /next:", details);
    return res.status(status).json({
      error: "Failed to move workflow",
      details: typeof details === "string" ? details : undefined,
    });
  }
});
```

> **Note**: If `/next` fails, it's not fatal. Vonage will automatically fall back to SMS after the Silent Auth timeout. The Android app should show the SMS input screen regardless of whether this call succeeds.

---

## The complete `server.js`

At this point your full `server.js` should look like this:

```js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { Auth } = require("@vonage/auth");
const { Verify2 } = require("@vonage/verify2");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const credentials = new Auth({
  applicationId: process.env.VONAGE_APP_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});

const verifyClient = new Verify2(credentials);

const verificationStore = new Map();

function requireFields(obj, fields) {
  for (const f of fields) {
    if (!obj || obj[f] == null || obj[f] === "") return f;
  }
  return null;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/verification", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["phone"]);
    if (missing) {
      return res.status(400).json({ error: `Field '${missing}' is required.` });
    }
    const { phone } = req.body;
    console.log("Received verification request for:", phone);
    const result = await verifyClient.newRequest({
      brand: "DemoApp",
      workflow: [
        { channel: "silent_auth", to: phone },
        { channel: "sms", to: phone },
      ],
    });
    console.log("Vonage newRequest result:", result);
    const now = new Date().toISOString();
    verificationStore.set(result.requestId, {
      requestId: result.requestId,
      phone,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      lastEvent: null,
    });
    return res.json({
      request_id: result.requestId,
      check_url: result.checkUrl || null,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const details = error?.response?.data || error?.message;
    console.error("Error /verification:", details);
    return res.status(status).json({
      error: "Failed to start verification",
      details: typeof details === "string" ? details : undefined,
    });
  }
});

app.post("/check-code", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["request_id", "code"]);
    if (missing) {
      return res.status(400).json({ error: `Field '${missing}' is required.` });
    }
    const { request_id, code } = req.body;
    const entry = verificationStore.get(request_id);
    if (!entry) {
      return res.status(404).json({ error: "Unknown request_id" });
    }
    console.log("Checking code for request:", request_id);
    const result = await verifyClient.checkCode(request_id, code);
    console.log("Vonage checkCode result:", result);
    const verified = result === "completed";
    if (verified) {
      verificationStore.set(request_id, {
        ...entry,
        status: "completed",
        updatedAt: new Date().toISOString(),
        lastEvent: { source: "check_code", result },
      });
    }
    return res.json({ verified, status: result || null });
  } catch (error) {
    const status = error?.response?.status || 500;
    const details = error?.response?.data || error?.message;
    console.error("Error /check-code:", details);
    if (status === 400 || status === 404) {
      return res.json({
        verified: false,
        error: typeof details === "string" ? details : "Invalid code",
      });
    }
    return res.status(status).json({
      error: "Failed to check code",
      details: typeof details === "string" ? details : undefined,
    });
  }
});

app.post("/callback", async (req, res) => {
  try {
    const { request_id, status } = req.body || {};
    if (!request_id) {
      return res.status(400).json({ error: "Missing request_id" });
    }
    console.log("Callback received:", { request_id, status });
    const entry = verificationStore.get(request_id);
    if (!entry) {
      console.warn("Callback for unknown request_id:", request_id);
      return res.status(200).json({ ok: true });
    }
    verificationStore.set(request_id, {
      ...entry,
      status: status || entry.status,
      updatedAt: new Date().toISOString(),
      lastEvent: req.body,
    });
    console.log(`Callback updated: ${request_id} -> ${status}`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error processing callback:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/next", async (req, res) => {
  try {
    const missing = requireFields(req.body, ["requestId"]);
    if (missing) {
      return res.status(400).json({ error: `Field '${missing}' is required.` });
    }
    const { requestId } = req.body;
    const entry = verificationStore.get(requestId);
    if (!entry) {
      return res.status(404).json({ error: "Unknown request_id" });
    }
    console.log("Moving to next workflow (SMS) for:", requestId);
    const result = await verifyClient.nextWorkflow(requestId);
    console.log("Vonage nextWorkflow result:", result);
    verificationStore.set(requestId, {
      ...entry,
      updatedAt: new Date().toISOString(),
      lastEvent: { source: "next_workflow" },
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    const status = error?.response?.status || 500;
    const details = error?.response?.data || error?.message;
    console.error("Error /next:", details);
    return res.status(status).json({
      error: "Failed to move workflow",
      details: typeof details === "string" ? details : undefined,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
```

---

## Configure the callback URL in the Vonage Dashboard

Vonage needs to know where to send callbacks. You need a **publicly accessible URL** — `localhost` isn't reachable from Vonage's servers.

In Codespaces, you can expose a port publicly:

1. In VS Code / Codespaces, open the **Ports** tab (bottom panel)
2. Find port `3000` and set its visibility to **Public**
3. Copy the forwarded URL (it looks like `https://your-codespace-name-3000.app.github.dev`)

Then in the [Vonage Dashboard](https://dashboard.nexmo.com/):

1. Go to **Applications** and open your application
2. Click **Edit**
3. Under **Network Registry**, find the **Verify** callback field
4. Take the URL you copied in step 3 above and add `/callback` at the end. Your final URL should look like this: `https://your-codespace-name-3000.app.github.dev/callback`
5. Save the application

**Important**: The URL is unique to your Codespace - do not copy the example above. Always use your own URL from the Ports tab with `/callback` appended.

### Test the callback manually

You can simulate a callback with cURL to verify your endpoint is working:

```bash
curl -X POST http://localhost:3000/callback \
  -H "Content-Type: application/json" \
  -d '{"request_id": "test-id", "status": "completed"}'
```

Expected response:

```json
{ "ok": true }
```

The terminal log should show:

```
Callback received: { request_id: 'test-id', status: 'completed' }
Callback for unknown request_id: test-id
```

(The "unknown" warning is expected here since `test-id` isn't in the store.)

---

## Checkpoint

- [ ] `POST /callback` returns `{ ok: true }` and logs the received status
- [ ] `POST /next` returns `{ ok: true }` for a valid `requestId`
- [ ] The callback URL is configured in the Vonage Dashboard
- [ ] The backend is fully implemented — all five endpoints are working

The backend is complete. In the next tutorial, you'll build the Android app that drives this flow from the user's side.

> Don't close this tutorial as you'll need the backend running to complete the Android app
