---
title: Set Up RCS Credentials
description: Add the Vonage Application and RCS sender details used by the exercise.
---

The application needs your Vonage Application credentials before it can send Messages API requests. Use the Application ID and private key from the Vonage Application connected to your RCS agent. You will add the private key in the editor first, then run the setup command in a new terminal.

Open `project/private.key`. It is an empty file. Paste the complete private key from your Vonage Application as the full file contents, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines exactly once.

Save `project/private.key`.

The first terminal is already running the exercise app, so open a new terminal before running the setup command. The new terminal opens in `project/` by default. Run:

```sh
npm run setup
```

The final line of the setup output prints the application URL again, for example:

```text
Application URL: https://<your-codespace-name>-3000.app.github.dev
```

Use this URL to reopen or reload the RCS app after setup.

The setup script asks for:

- your **Vonage Application ID**;
- your **RCS Sender ID**, also called the `vonage_id`;
- the RCS-capable recipient phone number.

The RCS Sender ID is the sender ID from your RCS onboarding or agent setup. Do not use a different application, and do not use the agent display name unless it is also the sender ID assigned to that agent.

The script checks whether Node.js can read `project/private.key` and writes the remaining values to `project/.env`.

Leave the application terminal running. The app reads the latest values from `.env` whenever you use it.
