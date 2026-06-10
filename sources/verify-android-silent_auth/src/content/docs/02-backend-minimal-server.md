---
title: A Minimal Server
description: Create the first version of server.js with a health endpoint, start it with nodemon, and confirm it's running with cURL.
---

Before adding any Vonage logic, let's get a working Express server running. This gives you a fast feedback loop: make a change, save the file, and the server restarts automatically.

---

## Create `server.js`

Inside the `project/` folder, open the file called `server.js` and add the following:

```js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
```

What this does:

- `cors()` — allows the Android app to call this API from a different origin
- `express.json()` — parses incoming JSON request bodies
- `GET /health` — a simple endpoint to confirm the server is running
- Port **3000** — the default; can be overridden with a `PORT` environment variable

---

## Test the health endpoint


Save the file. You should see it restart automatically in the terminal:

```
Restarting `server.js`
Backend listening on port 3000
```

Open a **second terminal** and run:


```bash
curl http://localhost:3000/health
```

Expected response:

```json
{ "status": "ok" }
```

If you see that response, the server is working correctly.

---

## Checkpoint

- [ ] `project/server.js` exists
- [ ] `server.js` restarts without errors
- [ ] `curl http://localhost:3000/health` returns `{ "status": "ok" }`
- [ ] Saving a change to `server.js` triggers an automatic restart