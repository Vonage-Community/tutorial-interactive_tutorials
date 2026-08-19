---
title: Set Up OpenAI
description: Create a small helper that initializes the OpenAI client when the bot needs it.
---

# Set Up OpenAI

The bot needs an OpenAI client before it can send the caller's transcription to the model. Keep the check inside a helper so the Express server can still start before the key is configured.

In `project/index.js`, find:

```js
// TODO: Set up OpenAI client
```

Replace it with:

```js
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not configured.');
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
```

The application will call this helper from the ASR webhook, where the OpenAI request is made.
