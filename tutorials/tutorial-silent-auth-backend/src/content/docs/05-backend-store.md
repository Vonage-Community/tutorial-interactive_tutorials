---
title: "The Verification Store"
description: "Understand why the backend needs to track verification state, then add a simple in-memory Map to do it."
step: 5
---

Before you add any endpoints, it's worth understanding *why* the backend needs to remember what's happening with each verification request. This will make the code you write in the next few steps much easier to reason about.

---

## Why we need state

A verification flow isn't a single request-response pair. It has a **lifecycle**:

```
started → pending (silent auth) → completed
                               ↘ sms pending → completed
                                             ↘ failed / expired
```

Three things make tracking state necessary:

### 1. Vonage callbacks arrive asynchronously

When you start a verification, Vonage does work in the background. It coordinates with the mobile carrier, sends SMS, waits for outcomes. It notifies your backend by calling your `/callback` endpoint (a webhook) at some future point in time.

The HTTP request that *started* the verification is long gone by then. Without a store, you have no way to connect the callback to the original request.

### 2. Webhooks can be delivered more than once

Vonage may retry a webhook delivery if your backend doesn't respond quickly enough. If you process the same callback twice (for example, marking a user verified twice) your application state becomes inconsistent. With a store, re-applying the same status to the same `request_id` is safe and harmless.

### 3. Debugging requires visibility

When something goes wrong ("the user got an SMS but verification never completed"), you need to answer: what was the last known status? What event did the callback send? A store gives you a single place to look.

---

## The store shape

Each entry in the store is keyed by `request_id` (the unique identifier Vonage returns when you start a verification). The value is a plain object:

```js
{
  requestId: "aaa-bbb-ccc-ddd",
  phone: "+34600111222",
  status: "pending",        // set by Vonage callbacks
  createdAt: "2026-01-01T10:00:00.000Z",
  updatedAt: "2026-01-01T10:00:05.000Z",
  lastEvent: null           // the raw body of the most recent callback
}
```

| Field | Description |
|-------|-------------|
| `requestId` | Vonage's unique ID for this verification attempt |
| `phone` | The number being verified |
| `status` | Latest status received from Vonage (e.g. `"pending"`, `"completed"`, `"failed"`) |
| `createdAt` | When the verification was started |
| `updatedAt` | When the entry was last modified |
| `lastEvent` | The raw body of the last callback received — useful for debugging |

---

## Add the store to `server.js`

Open `server.js` and add the `verificationStore` Map after the `verifyClient` setup and before the first endpoint:

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

/**
 * In-memory store for verification requests.
 * Maps request_id -> { requestId, phone, status, createdAt, updatedAt, lastEvent }
 *
 * Replace with Redis or a database for production use.
 */
const verificationStore = new Map();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
```

### Note on production use

A JavaScript `Map` lives in memory. It works perfectly for this tutorial but has two limitations in production:

- **It resets when the server restarts** — any in-progress verifications are lost
- **It doesn't scale across multiple server instances** — each process has its own memory

In a production system you'd replace the `Map` with **Redis** or a database (Postgres, MongoDB, etc.). The important thing is that the rest of the code that reads and writes to the store doesn't need to change — only the store implementation does.

---

## Checkpoint

- [ ] `verificationStore` is declared as `new Map()` in `server.js`
- [ ] It's positioned after the Vonage client setup and before the endpoints
- [ ] Server still starts cleanly after saving

```bash
curl http://localhost:3000/health
```

Should still return `{ "status": "ok" }`.
