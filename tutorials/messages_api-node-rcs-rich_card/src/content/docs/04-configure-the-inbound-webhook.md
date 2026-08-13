---
title: Configure the Inbound Webhook
description: Point your Vonage Application inbound URL at this Codespace.
---

Suggested replies are delivered to the **Inbound URL** configured on your Vonage Application. Set that URL before you send the rich card.

In the RCS Rich Card App, copy the **Inbound webhook** URL. It should look like this:

```text
https://<your-codespace-name>-3000.app.github.dev/webhooks/inbound
```

Then update the Vonage Application connected to your RCS agent:

1. Go to the [Vonage Dashboard](https://dashboard.vonage.com/applications) and open your Messages Application.
2. In the **Messages** capability, set the **Inbound URL** to the copied URL.
3. Set the method to **POST**.
4. Save the application.

The status webhook is set directly in the message payload later in this exercise, so you do not need to change the Dashboard Status URL for this step.
