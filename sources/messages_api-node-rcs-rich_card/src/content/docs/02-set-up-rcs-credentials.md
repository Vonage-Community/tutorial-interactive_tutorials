---
title: Set Up RCS Credentials
description: Add the Vonage Application ID, private key, RCS sender, and recipient number.
---

The app needs credentials from the Vonage Application connected to your RCS agent. Use the **same application** for the Application ID, private key, and RCS sender.

Open `project/private.key` and paste the full private key from your Vonage Application as the complete file contents. Include the `BEGIN PRIVATE KEY` and `END PRIVATE KEY` lines only once.

The first terminal is already running the exercise app, so open a new terminal before running the setup command. The new terminal opens in `project/` by default. Run:

```sh
npm run setup
```

The final line of the setup output prints the application URL again, for example:

```text
Application URL: https://<your-codespace-name>-3000.app.github.dev
```

Use this URL to reopen or reload the RCS rich card app after setup.

When prompted, enter:

- the **Vonage Application ID** for the Messages application connected to your RCS agent;
- the **RCS Sender ID**, also called the `vonage_id`;
- the **RCS recipient phone number**.

The script checks whether Node.js can read `project/private.key` and writes the remaining values to `project/.env`.

After setup completes, reload the application URL printed in the terminal.
