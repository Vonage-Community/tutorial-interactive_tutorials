---
title: Configure Vonage Webhooks
description: Point your Vonage application's answer and event URLs at this Codespace.
---

# Configure Vonage Webhooks

Now point your Vonage Voice Application at this Codespace. In the following URLs, replace `<forwarded-address>` with the complete address you copied in the previous step, without a trailing slash.

{% steps %}

1. Go to the [Vonage Dashboard](https://dashboard.vonage.com/applications) and open your Voice Application.

2. Set the **Answer URL** to:
   ```
   <forwarded-address>/webhooks/answer
   ```
   Set the method to **GET**.

3. Set the **Event URL** to:
   ```
   <forwarded-address>/webhooks/events
   ```
   Set the method to **POST**.

4. Save your changes.

5. Confirm that the Voice-capable virtual number you plan to call is linked to this application.

{% /steps %}

{% aside type="tip" %}
For example, if the forwarded address is `https://example-3000.app.github.dev`, the Answer URL is `https://example-3000.app.github.dev/webhooks/answer`.
{% /aside %}
