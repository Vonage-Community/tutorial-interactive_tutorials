---
title: Add Session State
description: Store conversation history by Voice API call UUID.
---

# Add Session State

The basic bot answers one question at a time. To support follow-up questions, store each call's conversation history in memory and reuse the same speech prompt after each answer.

In `project/index.js`, add this code directly after the `getOpenAIClient()` helper:

```js
const sessions = new Map();

function getInitialHistory() {
  return [
    {
      role: 'system',
      content: 'You are a helpful, concise assistant on a phone call.'
    }
  ];
}

function getConversationalNCCO(text) {
  return [
    { action: 'talk', text },
    {
      action: 'input',
      eventUrl: [`${BASE_URL}/webhooks/asr`],
      eventMethod: 'POST',
      type: ['speech'],
      speech: { language: 'en-US', endOnSilence: 1 }
    }
  ];
}
```

The `Map` keeps each caller separate by call UUID. The helper returns a `talk` action followed by another `input` action, so the bot can continue listening.
