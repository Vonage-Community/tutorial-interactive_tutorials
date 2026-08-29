---
title: "The /verification Endpoint"
description: "Add the POST /verification endpoint that starts a Vonage Verify request, stores the entry, and returns request_id and check_url to the client."
step: 6
---

This is the first endpoint the Android app will call. The user enters their phone number, the app sends it here, and this endpoint asks Vonage to start a verification.

---

## What this endpoint does

1. Receives a `phone` number from the request body
2. Calls `verifyClient.newRequest()` with a two-step workflow: try **Silent Authentication** first, fall back to **SMS**
3. Saves the initial entry to `verificationStore`
4. Returns `request_id` and `check_url` to the client

The `check_url` is only present when Vonage can attempt Silent Authentication for this phone number and network. The Android app uses it to make the cellular request that proves the user's identity. If it's `null`, the app skips Silent Auth and goes straight to SMS.

---

## Add a helper function

First, add a small helper that validates required fields in request bodies. Add it just below the `verificationStore` declaration:

```js
function requireFields(obj, fields) {
  for (const f of fields) {
    if (!obj || obj[f] == null || obj[f] === "") return f;
  }
  return null;
}
```

This returns the name of the first missing field, or `null` if all fields are present. You'll use it in every endpoint.

---

## Add `POST /verification` to `server.js`

Open `server.js` and add the endpoint before the `app.listen` call:

```js
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
```

### Understanding the workflow array

```js
workflow: [
  { channel: "silent_auth", to: phone },
  { channel: "sms", to: phone },
]
```

Vonage processes channels in order. It tries Silent Authentication first. If it doesn't complete within the timeout (about 20 seconds), Vonage automatically starts the SMS step. Your backend can also trigger the SMS step immediately by calling `/next` (you'll add that endpoint in step 08).

---

## Test with cURL

Save `server.js` (`nodemon` restarts), then test the endpoint. Replace the phone number with a real number in E.164 format:

```bash
curl -X POST http://localhost:3000/verification \
  -H "Content-Type: application/json" \
  -d '{"phone": "+34600000000"}'
```

Expected response:

```json
{
  "request_id": "aaa-bbb-ccc-ddd",
  "check_url": "https://api.nexmo.com/v2/verify/aaa-bbb-ccc-ddd/silent-auth/redirect"
}
```

- `request_id` is always present — keep this value, you'll need it for the next test
- `check_url` is present when Silent Auth is available for the number/carrier; it may be `null`

### Test validation

Try sending a request without the `phone` field:

```bash
curl -X POST http://localhost:3000/verification \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected response:

```json
{ "error": "Field 'phone' is required." }
```

---

## Check the server logs

In the nodemon terminal you should see:

```
Received verification request for: +34600000000
Vonage newRequest result: { requestId: 'aaa-bbb-ccc-ddd', checkUrl: 'https://...' }
```

---

## Checkpoint

- [ ] `POST /verification` with a valid phone returns `request_id` and `check_url`
- [ ] `POST /verification` without `phone` returns a 400 error
- [ ] The server logs show the Vonage result
- [ ] A real phone number receives an SMS (if Silent Auth isn't available for that number)
