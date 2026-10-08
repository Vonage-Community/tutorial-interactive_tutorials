---
title: Set Up SMS Credentials
description: Add the Vonage Application and phone numbers used by the status monitor.
---

The application sends its test SMS through the Vonage Server SDK. Add the private key in the editor first, then run the setup command in a new terminal.

Open `project/private.key`. Paste the complete private key from your Vonage Application as the full file contents, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines exactly once. Save the file.

The first terminal is already running the exercise application. Open a new terminal by selecting the plus icon in the terminal panel, then run:

```sh
npm run setup
```

The setup script asks for your **Vonage Application ID**, the linked **Vonage SMS number**, and the destination phone number. Enter phone numbers in E.164 format using digits only, without a leading `+` or `00`.

The final lines print the application URL and the status webhook URL. Keep the application terminal running.
