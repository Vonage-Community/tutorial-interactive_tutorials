---
title: Use the Inbound Webhook
description: Understand where suggested reply events are delivered.
---

Suggested replies are delivered to the **Inbound URL** configured on the Messages Application connected to your RCS agent. This exercise expects that application to use the current Codespace inbound endpoint:

```text
https://<your-codespace-name>-3000.app.github.dev/webhooks/inbound
```

The RCS Rich Card App displays the same URL for reference. When the recipient taps a suggested reply, Vonage sends the reply event to this endpoint and the app displays it in the **Inbound replies** table.

The status webhook is set directly in the message payload later in this exercise, so you do not need to change the Dashboard Status URL for this step.
