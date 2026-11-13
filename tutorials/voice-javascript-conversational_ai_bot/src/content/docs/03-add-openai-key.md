---
title: Add API Key
description: Add an OpenAI-compatible API key and optionally choose the API endpoint and model.
---

# Add API Key

Open `project/.env` and add your OpenAI-compatible API key. The Codespace creates this file from `project/.env.example` during setup. OpenAI is the default provider. Groq is a free alternative that exposes an OpenAI-compatible API, so you can use the following values with a Groq API key:

```env
OPENAI_API_KEY=your-openai-or-groq-api-key
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=openai/gpt-oss-20b
VONAGE_NUMBER=
HUMAN_AGENT_NUMBER=
```

`OPENAI_BASE_URL` and `OPENAI_MODEL` are optional overwriteable values. Leave them empty or remove them to use the current behavior: OpenAI's default endpoint and the `gpt-4o` model. To use OpenAI, set `OPENAI_API_KEY` to an OpenAI key and leave those two variables empty.

Leave `VONAGE_NUMBER` and `HUMAN_AGENT_NUMBER` empty for now. You will use them later when you add the human transfer flow.

Do not wrap the key in quotation marks. If you are editing the source files outside Codespaces and only see `.env.example`, copy it to `.env` first. After the next changes to `index.js`, the server will restart and read the updated environment file.
