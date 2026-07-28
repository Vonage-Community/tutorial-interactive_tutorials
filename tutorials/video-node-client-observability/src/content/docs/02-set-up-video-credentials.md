---
title: Set Up Video Credentials
description: Create a Video API application for the exercise using your Vonage account credentials.
---

The backend needs a Video API application before it can create sessions and client tokens. The first terminal is already running the exercise, so open a new terminal before you run the setup command.

In the bottom panel, select the **+** icon next to the current terminal tab. If you do not see it, open the terminal menu and select **New Terminal**.

The new terminal opens in `project/` by default. Run:

```sh
npm run setup-credentials
```

When prompted, enter your Vonage account **API key** and **API secret** from the [Vonage API Dashboard](https://dashboard.vonage.com/settings).

The setup creates a new Video API application and stores its Application ID and private key in a local `.env` file. Do not enter an existing Application ID or private key at the prompts.

Keep the application terminal running. In the next step, you will open the Video Quality Monitor and confirm that it can read the generated credentials.
