---
title: Set Up RCS Credentials
description: Add the Vonage Application and RCS sender details used by the exercise.
---

The application needs your Vonage Application credentials before it can sign Messages API requests. The first terminal is already running the exercise app, so open a new terminal before running the setup command.

The new terminal opens in `project/` by default. Run:

```sh
npm run setup
```

The setup script asks for:

- your **Vonage Application ID**;
- your **RCS Sender ID**;
- the RCS-capable recipient phone number;
- the RCS message category, or `transaction` if you press Enter;
- the private key for your Vonage Application.

You can either provide the path to a private key file in the Codespace or paste the private key when prompted. The script stores the key in `project/private.key` and writes the remaining values to `project/.env`.

Leave the application terminal running. The app reads the latest values from `.env` whenever you use it.
