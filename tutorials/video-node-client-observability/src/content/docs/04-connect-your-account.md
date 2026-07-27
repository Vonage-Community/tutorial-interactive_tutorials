---
title: Connect Your Account
description: Create a Video API application for the exercise using your Vonage account credentials.
---

# Connect Your Account

The backend needs a Video API application before it can create sessions and client tokens. In the terminal, run:

```sh
cd project && npm run setup-credentials
```

When prompted, enter your Vonage account **API key** and **API secret** from the [Vonage API Dashboard](https://dashboard.vonage.com/settings).

The setup creates a new Video API application and stores its Application ID and private key in a local `.env` file. Do not enter an existing Application ID or private key at the prompts.

Return to the **Video Quality Monitor** and select **Check setup**. The account notice should disappear.
