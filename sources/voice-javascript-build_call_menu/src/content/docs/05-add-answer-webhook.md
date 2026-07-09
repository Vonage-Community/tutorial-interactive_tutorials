---
title: Add the Answer Webhook
description: Add a GET /webhooks/answer route that returns an NCCO.
---

# Add the Answer Webhook

When someone calls your Vonage number, the Vonage API platform sends a **GET** request to your answer URL. Your server must respond with an **NCCO** — a JSON array of call-control actions.

In `project/index.js`, find the comment:

```
// TODO: Add the answer webhook
```

Replace it with:

```js
app.get('/webhooks/answer', (req, res) => {
  res.json(mainMenu());
});
```

This route calls `mainMenu()` (which you will write in the next step) and returns the resulting NCCO as JSON.

{% aside %}
The answer webhook must use **GET** — you will configure this in the Vonage Dashboard later.
{% /aside %}
