---
title: Add Answer Webhook
description: Return the first NCCO when someone calls your Vonage number.
---

# Add Answer Webhook

When someone calls your Vonage number, the Vonage API platform sends a `GET` request to your Answer URL. Your server responds with an NCCO that greets the caller and starts speech input.

In `project/index.js`, find:

```js
// TODO: Add the answer webhook
```

Replace it with:

```js
app.get('/webhooks/answer', (req, res) => {
  const ncco = [
    {
      action: 'talk',
      text: 'Hi, I am your AI assistant. How can I help you today?'
    },
    {
      action: 'input',
      eventUrl: [`${BASE_URL}/webhooks/asr`],
      eventMethod: 'POST',
      type: ['speech'],
      speech: {
        language: 'en-US',
        endOnSilence: 1
      }
    }
  ];

  res.json(ncco);
});
```

The `talk` action plays the greeting. The `input` action listens for speech and sends the transcription to `/webhooks/asr`.
