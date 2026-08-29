---
title: "Add the Vonage SDK"
description: "Initialise the Vonage Auth and Verify clients in server.js and understand how JWT authentication works."
step: 4
---

Now that credentials are in place, let's connect the Vonage SDK to `server.js`. This is the piece that lets your backend start verifications and validate codes.

---

## Why use the SDK instead of raw HTTP?

You could call the Vonage API directly with `fetch` or `axios`. The SDK is preferred for a few reasons:

- **Authentication is handled for you** — the Verify API requires JWT tokens signed with your private key. Getting that wrong is a common source of bugs. The SDK does it correctly every time.
- **Cleaner code** — instead of building URLs, headers, and parsing response shapes manually, you call `newRequest()` and `checkCode()`.
- **Easier maintenance** — when Vonage changes the API or adds features, an SDK update keeps you compatible.

---

## Update `server.js`

Open `server.js` and add the SDK imports and client setup near the top, after `require("dotenv").config()`:

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

// Vonage auth
const credentials = new Auth({
  applicationId: process.env.VONAGE_APP_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});

const verifyClient = new Verify2(credentials);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
```

### What's happening here?

**`Auth`** creates a credential object that reads your Application ID and private key from the environment. Internally, when you make an API call, it generates a signed JWT and attaches it to the request header automatically — you never touch the JWT directly.

**`Verify2`** is the Vonage Verify v2 client. You'll use two methods from it:

| Method | What it does |
|--------|-------------|
| `verifyClient.newRequest(...)` | Starts a new verification (silent auth → SMS) |
| `verifyClient.checkCode(requestId, code)` | Validates the code the user entered |
| `verifyClient.nextWorkflow(requestId)` | Skips the current channel and moves to the next one (used to force SMS fallback) |

---

## Confirm the server still starts cleanly

Save `server.js`. nodemon restarts automatically. Check the terminal — you should see no errors:

```
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Backend listening on port 3000
```

If you see an error like `Cannot find module '@vonage/auth'`, make sure you ran `npm install` from inside the `workspace/` folder.

Test the health endpoint to confirm everything is still working:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{ "status": "ok" }
```

---

## Checkpoint

- [ ] `server.js` imports `Auth` and `Verify2`
- [ ] `credentials` and `verifyClient` are initialised at the top level
- [ ] Server starts without errors after saving
- [ ] `GET /health` still returns `{ "status": "ok" }`
