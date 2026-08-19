---
title: Replace Answer Webhook
description: Initialize conversation history when the call starts.
---

# Replace Answer Webhook

The answer webhook now needs to start a conversation history for the caller and enter the repeating speech loop.

Replace the existing `app.get('/webhooks/answer', ...)` handler with:

```js
app.get('/webhooks/answer', (req, res) => {
  const uuid = req.query.uuid;
  sessions.set(uuid, getInitialHistory());

  res.json(getConversationalNCCO('Hello! What is on your mind?'));
});
```

Vonage includes the call `uuid` in the answer webhook request. Your app uses it as the key for that caller's history.
