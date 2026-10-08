---
title: Configure the Status URL
description: Point your Vonage Application status webhook at the Codespace.
---

Open your Vonage Application in the [Vonage Dashboard](https://dashboard.vonage.com/applications), then edit its **Messages** capability.

Set the **Status URL** to the complete URL copied from the SMS Status Monitor. It should follow this format:

```text
https://<your-codespace-name>-3000.app.github.dev/webhooks/status
```

Leave the webhook method set to **POST** and save the application. Confirm that the SMS-capable Vonage number used by the exercise is linked to this application.

Codespace URLs change when you create a new Codespace, so update the Status URL again if you recreate the exercise environment.
