---
title: Add Event Webhook
description: Log call progress events sent by the Voice API platform.
---

# Add Event Webhook

Vonage sends call progress events such as `ringing`, `answered`, and `completed` to your Event URL. Log the body so you can inspect the call state from the terminal.

In `project/index.js`, find:

```js
// TODO: Add the event webhook
```

Replace it with:

```js
app.post('/webhooks/events', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});
```

Save `project/index.js`. The server reloads automatically.
