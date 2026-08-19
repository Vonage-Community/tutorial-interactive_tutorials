---
title: Add OpenAI Key
description: Add your OpenAI API key to the prepared environment file.
---

# Add OpenAI Key

Open `project/.env` and add your OpenAI API key. The Codespace creates this file from `project/.env.example` during setup.

```env
OPENAI_API_KEY=your-openai-api-key
VONAGE_NUMBER=
HUMAN_AGENT_NUMBER=
```

Leave `VONAGE_NUMBER` and `HUMAN_AGENT_NUMBER` empty for now. You will use them later when you add the human transfer flow.

Do not wrap the key in quotation marks. If you are editing the source files outside Codespaces and only see `.env.example`, copy it to `.env` first. After the next changes to `index.js`, the server will restart and read the updated environment file.
