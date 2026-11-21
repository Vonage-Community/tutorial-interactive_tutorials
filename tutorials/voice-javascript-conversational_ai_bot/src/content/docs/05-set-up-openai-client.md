---
title: Set Up OpenAI
description: Create a helper for an OpenAI-compatible client and configurable model.
---

# Set Up OpenAI

The bot needs an OpenAI-compatible client before it can send the caller's transcription to the model. The official OpenAI SDK also works with Groq because Groq provides an OpenAI-compatible API. Keep the check inside a helper so the Express server can still start before the key is configured.

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

  const clientOptions = { apiKey: process.env.OPENAI_API_KEY };
  if (process.env.OPENAI_BASE_URL) {
    clientOptions.baseURL = process.env.OPENAI_BASE_URL;
  }

  return new OpenAI(clientOptions);
}

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
```

When `OPENAI_BASE_URL` is empty or not provided, the SDK uses OpenAI's default endpoint. When `OPENAI_MODEL` is empty or not provided, the application uses `gpt-4o`, preserving the original behavior. The application will call this helper and use `OPENAI_MODEL` from the ASR webhook, where the API request is made.
