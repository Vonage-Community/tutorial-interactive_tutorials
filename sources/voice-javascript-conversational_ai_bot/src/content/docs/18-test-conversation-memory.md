---
title: Test Conversation Memory
description: Confirm that the bot understands a follow-up question.
---

# Test Conversation Memory

The Vonage webhook URLs do not change. Call your Vonage number again and test a short two-turn conversation.

For example:

1. Ask: `What is the capital of France?`
2. After the bot answers, ask: `What is it famous for?`

The second answer should use the earlier context and understand that `it` refers to Paris.

If the bot answers the second question as if it were unrelated, check that the `sessions` Map, `getConversationalNCCO()`, and replaced ASR webhook were saved in `project/index.js`.
