---
title: Set Up SMS Credentials
description: Add the Vonage Application and phone numbers used by the exercise.
---

The application uses JWT authentication through the Vonage Server SDK. Add the private key in the editor first, then run the setup command in a new terminal.

Open `project/private.key`. Paste the complete private key from your Vonage Application as the full file contents, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines exactly once. Use the private key generated for the same application whose ID you will enter during setup, then save the file.

The first terminal is already running the exercise application. Open a new terminal by selecting the plus icon in the terminal panel, then run:

```sh
npm run setup
```

The setup script asks for the following values:

- **Vonage Application ID**: The UUID shown on your application's page in the Vonage Dashboard. This is not your account API key.
- **SMS Sender ID**: The name or number displayed as the message sender. You can use an alphanumeric Sender ID of up to 11 letters, numbers, or spaces where the destination country supports it. A purchased Vonage number is not required for this exercise unless the destination country requires a numeric sender.
- **SMS recipient phone number**: The destination phone that should receive the test message. Use a number you can access. For a trial account, it must be registered as a verified test number in the Dashboard.

Enter the recipient number in E.164 format as `<country-code><national-number>`, using 7 to 15 digits without a leading `+` or `00`; for example, `447700900000`. The exercise accepts international destination numbers and is not limited to a specific country. If you use a phone number as the Sender ID, enter it in the same format. Check the [country-specific SMS requirements](https://developer.vonage.com/en/messages/guides/sms/country-specific-features) before choosing a Sender ID. The script validates `project/private.key` and saves the other values in `project/.env`.

The final line prints the application URL again. Keep the application terminal running and reload that URL after setup.
