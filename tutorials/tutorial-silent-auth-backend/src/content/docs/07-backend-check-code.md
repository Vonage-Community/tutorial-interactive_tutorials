---
title: "The /check-code Endpoint"
description: "Add the POST /check-code endpoint that validates the OTP code with Vonage and returns a verified result to the client."
step: 7
---

Once a user receives a code, either from Silent Authentication or SMS, the Android app sends it to this endpoint. The backend passes it to Vonage, which confirms whether it's valid, and returns a clear `verified` result to the client.

---

## What this endpoint does

1. Receives `request_id` and `code` from the request body
2. Looks up the entry in `verificationStore` (returns 404 if not found)
3. Calls `verifyClient.checkCode(request_id, code)`
4. Updates the store status to `"completed"` if verified
5. Returns `{ verified: true/false }` to the client

---

## Add `POST /check-code` to `server.js`

Open `server.js` and add this endpoint after `/verification`:

```js
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

    return res.json({
      verified,
      status: result || null,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const details = error?.response?.data || error?.message;

    console.error("Error /check-code:", details);

    // If it's an invalid code error, return 200 with verified: false
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
```

### Key detail: invalid codes return 200

When a user types the wrong code, Vonage returns a `400` response. This is a normal user-facing error, not a server failure. The endpoint catches that case and returns `{ verified: false }` with a 200 status so the Android app can display a friendly "invalid code" message rather than treating it as a crash.


---

## Checkpoint

- [ ] `POST /check-code` with a valid code returns `{ verified: true }`
- [ ] `POST /check-code` with an invalid code returns `{ verified: false }`
- [ ] `POST /check-code` without required fields returns a 400 error
- [ ] `POST /check-code` with an unknown `request_id` returns a 404 error
- [ ] The store entry `status` updates to `"completed"` after success
