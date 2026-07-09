---
title: Add the Event Webhook
description: Acknowledge call progress events from the Vonage API platform.
---

# Add the Event Webhook

Vonage sends call progress events (ringing, answered, completed, etc.) to your **event URL**. You need to acknowledge them so Vonage does not retry.

In `project/index.js`, find the comment:

```
// TODO: Add the event webhook
```

Replace it with:

```js
app.post('/webhooks/events', (req, res) => {
  console.log(req.body);
  res.sendStatus(204);
});
```

{% aside %}
Returning **HTTP 204 No Content** tells the Vonage API platform that you have received the event, preventing duplicate delivery.
{% /aside %}

Your `project/index.js` is now complete. Save the file.
