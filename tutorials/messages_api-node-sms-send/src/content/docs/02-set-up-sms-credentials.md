---
title: Set Up SMS Credentials
description: Add the Vonage Application and phone numbers used by the exercise.
---

The application uses JWT authentication through the Vonage Server SDK. Add the private key in the editor first, then run the setup command in a new terminal.

Open `project/private.key`. Paste the complete private key from your Vonage Application as the full file contents, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines exactly once. Save the file.

The first terminal is already running the exercise application. Open a new terminal by selecting the plus icon in the terminal panel, then run:

```sh
npm run setup
```

The setup script asks for:

- your **Vonage Application ID**;
- the SMS-capable **Vonage number** linked to the application;
- the destination phone number.

Enter phone numbers in E.164 format using digits only, without a leading `+` or `00`. The script validates `project/private.key` and saves the other values in `project/.env`.

The final line prints the application URL again. Keep the application terminal running and reload that URL after setup.
