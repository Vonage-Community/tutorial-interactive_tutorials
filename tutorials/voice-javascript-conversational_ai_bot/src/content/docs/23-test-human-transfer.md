---
title: Test Human Transfer
description: Ask the bot to connect you to a human agent.
---

# Test Human Transfer

Call your Vonage number again. First ask a regular question to confirm the bot still answers normally.

Then say:

```text
I want to speak to a human.
```

You should hear:

```text
Please hold while I connect you to a human representative.
```

The phone number set as `HUMAN_AGENT_NUMBER` should ring. When it answers, Vonage bridges the original caller and the human agent into the same conversation.

If the transfer does not happen, check that:

- `VONAGE_NUMBER` and `HUMAN_AGENT_NUMBER` are set in `project/.env`;
- both numbers use E.164 format without `+`;
- `VONAGE_NUMBER` is linked to the Voice Application;
- your OpenAI API key is valid and has available credit.
