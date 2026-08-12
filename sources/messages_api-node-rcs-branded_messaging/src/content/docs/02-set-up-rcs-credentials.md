---
title: Set Up RCS Credentials
description: Add the Vonage Application and RCS sender details used by the exercise.
---

The application needs your Vonage Application credentials before it can sign Messages API requests. You will add the private key in the editor first, then run the setup command in a new terminal.

Open `project/private.key`. Replace the placeholder text with the complete private key from your Vonage Application, including these lines:

```text
-----BEGIN PRIVATE KEY-----
```

and:

```text
-----END PRIVATE KEY-----
```

Save `project/private.key`.

The first terminal is already running the exercise app, so open a new terminal before running the setup command. The new terminal opens in `project/` by default. Run:

```sh
npm run setup
```

The setup script asks for:

- your **Vonage Application ID**;
- your **RCS Sender ID**;
- the RCS-capable recipient phone number.

The script checks whether Node.js can read `project/private.key` and writes the remaining values to `project/.env`. The exercise uses `transaction` as the RCS message category.

Leave the application terminal running. The app reads the latest values from `.env` whenever you use it.
