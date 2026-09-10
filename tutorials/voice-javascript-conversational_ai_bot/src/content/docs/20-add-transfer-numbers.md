---
title: Add Transfer Numbers
description: Configure the Vonage number and the phone number that should receive transferred calls.
---

# Add Transfer Numbers

The transfer flow needs two phone numbers: your linked Vonage virtual number and the phone number that should receive the transferred call.

Open `project/.env` and set:

```env
OPENAI_API_KEY=your-openai-api-key
VONAGE_NUMBER=your-vonage-number
HUMAN_AGENT_NUMBER=your-human-agent-number
```

Replace `your-vonage-number` and `your-human-agent-number` with your actual numbers. Use E.164 format (digits only, no `+`, spaces, or punctuation), for example `14155550100`. `VONAGE_NUMBER` must be the Voice-capable Vonage number linked to your application.

In `project/index.js`, add this code directly after `getConversationalNCCO()`:

```js
const VONAGE_NUMBER = process.env.VONAGE_NUMBER;
const HUMAN_AGENT_NUMBER = process.env.HUMAN_AGENT_NUMBER;
```

If possible, use a different phone for `HUMAN_AGENT_NUMBER` than the one you use to call the bot. Some carriers do not route a transfer back to the same active phone cleanly.
