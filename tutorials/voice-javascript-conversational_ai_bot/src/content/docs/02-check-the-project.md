---
title: Check the Project
description: Review the starter project and the TODO comments you will replace.
---

# Check the Project

Your Codespace already contains a starter project in `project/`. Open `project/index.js`; it contains a minimal Express server with TODO comments for each part of the Voice API flow.

```text
project/
  index.js
  package.json
  .env
```

Here is the starter file:

```js
require('dotenv').config();

const express = require('express');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// TODO: Set up BASE_URL
// TODO: Set up OpenAI client

app.get('/', (req, res) => {
  res.send("I'm listening!");
});

// TODO: Add the answer webhook
// TODO: Add the ASR webhook
// TODO: Add the event webhook

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

The `package.json` file defines a `start` script that uses `node --watch index.js`. Codespaces starts it automatically, so the server reloads whenever you save `index.js`.
