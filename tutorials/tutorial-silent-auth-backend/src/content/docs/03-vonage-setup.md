---
title: "Auth: Configure Vonage Credentials"
description: "Create a Vonage Application in the Dashboard, download your private key, and configure the backend with your credentials."
step: 3
---

The Vonage Verify API uses **JWT authentication**. Your backend signs each request with a private key that proves it's allowed to call Vonage. In this step you'll add the credentials for the Vonage Application previously created, and wire your credentials into the backend.

> **Security rule**: The private key must only live on the backend. It must never be bundled into a mobile app or committed to git.

---

## Step 1: Add the private key to your project

Upload (or copy) the downloaded `private.key` file into the `workspace/` folder of your project.

The `.gitignore` you created in the previous step already excludes `private.key` from git. Double-check:

```bash
cat .gitignore
```

You should see `private.key` listed. If it isn't, add it:

```bash
echo "private.key" >> .gitignore
```

---

## Step 2: Create the `.env` file

Create a file called `.env` inside `workspace/` and add the following, replacing the placeholder values with your own:

```
VONAGE_APP_ID=your_application_id_here
VONAGE_PRIVATE_KEY=./private.key
```

- `VONAGE_APP_ID` — the Application ID you copied from the Dashboard
- `VONAGE_PRIVATE_KEY` — a relative path to the private key file; `./private.key` works if both files are in `workspace/`

> Using a relative path like `./private.key` keeps the project portable — it works on any machine regardless of the absolute path.

---

## Step 3: Confirm credentials load at startup

Open `server.js` and add the following at the top of the file:

```js
require("dotenv").config();

const cors = require("cors");
```

The `require("dotenv").config()` call at the top of `server.js` loads the `.env` file automatically. Let's add a quick startup log to confirm the credentials are present.

Update the `app.listen` block at the bottom to log the Application ID:

```js
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Vonage App ID: ${process.env.VONAGE_APP_ID}`);
});
```

Save the file. nodemon restarts automatically. Check the terminal, you should see your Application ID printed:

```
Backend listening on port 3000
Vonage App ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

If you see `Vonage App ID: undefined`, the `.env` file is in the wrong location or has a typo. Make sure it's inside the `workspace/` folder and that the variable names match exactly.

Once confirmed, you can remove the `console.log` for the App ID (it's not a secret, but there's no need to log it in production).

---

## Your project structure so far

```
workspace/
├── node_modules/
├── .env               ← credentials (ignored by git)
├── .gitignore
├── package.json
├── private.key        ← JWT signing key (ignored by git)
└── server.js
```

---

## Checkpoint

- [ ] Vonage Application created in the Dashboard with Network Registry enabled
- [ ] `private.key` is in `workspace/` and listed in `.gitignore`
- [ ] `worspace/.env` has `VONAGE_APP_ID` and `VONAGE_PRIVATE_KEY`
- [ ] `nodemon server.js` starts and shows the correct Application ID in the logs
