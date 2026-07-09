---
title: Configure Vonage Webhooks
description: Point your Vonage application's answer and event URLs at this Codespace.
---

# Configure Vonage Webhooks

Now point your Vonage Voice Application at this Codespace.

{% steps %}

1. Go to the [Vonage Dashboard](https://dashboard.vonage.com/applications) and open your Voice Application.

2. Set the **Answer URL** to:
   ```
   https://<your-codespace-name>-3000.app.github.dev/webhooks/answer
   ```
   Set the method to **GET**.

3. Set the **Event URL** to:
   ```
   https://<your-codespace-name>-3000.app.github.dev/webhooks/events
   ```
   Set the method to **POST**.

4. Save your changes.

{% /steps %}

{% aside type="tip" %}
Replace `<your-codespace-name>` with the forwarded address you copied in the previous step — everything before `-3000.app.github.dev`.
{% /aside %}
