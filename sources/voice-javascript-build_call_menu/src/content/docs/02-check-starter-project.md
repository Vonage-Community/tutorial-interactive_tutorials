---
title: Check the Starter Project
description: Explore the starter project/index.js and understand the TODO paste targets.
---

# Check the Starter Project

Your Codespace already contains a starter project in the `project/` directory. Open `project/index.js` — it contains a minimal Express server with placeholder comments that mark where you will add code in each step.

{% filetree %}

- project/
  - index.js
  - package.json

{% /filetree %}

Here is what `project/index.js` looks like right now:

```js
const express = require('express');
const app = express();

app.use(express.json());

// TODO: Set up BASE_URL

app.get('/', (req, res) => {
  res.send("I'm listening!");
});

// TODO: Add the answer webhook

// TODO: Add the mainMenu function

// TODO: Add the DTMF webhook

// TODO: Add the event webhook

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

You will fill in each `TODO` comment in the following steps. The server start code (`app.listen`) is already in place so the app is always runnable.
