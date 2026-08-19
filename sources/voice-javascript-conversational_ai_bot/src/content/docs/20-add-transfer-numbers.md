---
title: Add Transfer Numbers
description: Configure the Vonage number and the phone number that should receive transferred calls.
---

# Add Transfer Numbers

The transfer flow needs two phone numbers: your linked Vonage virtual number and the phone number that should receive the transferred call.

Open `project/.env` and set:

```env
OPENAI_API_KEY=your-openai-api-key
VONAGE_NUMBER=14155550100
HUMAN_AGENT_NUMBER=15551234567
```

Use E.164 format without `+`, spaces, or punctuation. `VONAGE_NUMBER` must be the Voice-capable Vonage number linked to your application.

In `project/index.js`, add this code directly after `getConversationalNCCO()`:

```js
const VONAGE_NUMBER = process.env.VONAGE_NUMBER;
const HUMAN_AGENT_NUMBER = process.env.HUMAN_AGENT_NUMBER;
```

If possible, use a different phone for `HUMAN_AGENT_NUMBER` than the one you use to call the bot. Some carriers do not route a transfer back to the same active phone cleanly.
