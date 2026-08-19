---
title: Test Basic Bot
description: Call your Vonage number and test the first AI response.
---

# Test Basic Bot

With your server running and your Vonage application configured, call your Vonage virtual number from your phone.

You should hear:

```text
Hi, I am your AI assistant. How can I help you today?
```

Ask a short question, such as:

```text
Why is the sky blue?
```

The bot captures your speech, sends the transcription to OpenAI, and reads the response back to you.

If the call does not connect or you hear an error, check that:

- the server is still running in the terminal;
- port `3000` is still public;
- the Answer URL and Event URL match your current Codespace URL;
- your Vonage number is linked to the Voice Application;
- `OPENAI_API_KEY` is set in `project/.env`.
