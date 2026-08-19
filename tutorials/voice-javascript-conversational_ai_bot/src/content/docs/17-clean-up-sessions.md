---
title: Clean Up Sessions
description: Remove stored conversation history when the call ends.
---

# Clean Up Sessions

When the call completes, remove its history from the `sessions` Map. This keeps the in-memory store from growing after callers hang up.

Replace the existing `app.post('/webhooks/events', ...)` handler with:

```js
app.post('/webhooks/events', (req, res) => {
  console.log(req.body);

  if (req.body.status === 'completed') {
    sessions.delete(req.body.uuid);
  }

  res.sendStatus(200);
});
```

Save `project/index.js`. The server reloads automatically.
