---
title: Add the DTMF Webhook
description: Handle keypress input and respond with the appropriate NCCO.
---

# Add the DTMF Webhook

When the caller presses a key, Vonage sends a **POST** request to `/webhooks/dtmf`. Your server reads the digit and responds with an appropriate NCCO.

In `project/index.js`, find the comment:

```
// TODO: Add the DTMF webhook
```

Replace it with:

```js
app.post('/webhooks/dtmf', (req, res) => {
  let actions = [];

  switch (req.body.dtmf.digits) {
    case '1':
      actions.push({
        action: 'talk',
        text: `It is ${new Intl.DateTimeFormat(undefined, {
          dateStyle: 'full',
          timeStyle: 'long',
        }).format(Date.now())}`,
      });
      break;
  }

  const ncco = actions.concat(mainMenu());
  res.json(ncco);
});
```

If the caller presses **1**, a `talk` action is prepended to the NCCO to read out the current date and time. For any other key, the actions array stays empty and the menu simply repeats. Either way, `mainMenu()` is appended so the caller is always returned to the menu.
