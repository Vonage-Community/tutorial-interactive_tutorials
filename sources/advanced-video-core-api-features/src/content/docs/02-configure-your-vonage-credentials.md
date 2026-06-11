---
title: "Configure your Vonage credentials"
description: "Workspace setup"
---

Open a new terminal in the Codespace, then run:

```sh
npm run setup-credentials
```

When the terminal asks, paste your Vonage account API key and account API secret from the Vonage dashboard settings.

The script creates a new Vonage Video application in your account automatically.
You do not need to create one manually.
It will appear in your Vonage Dashboard under Applications with a name like `Advanced Video Exercises - <codespace-name>`.
You can manage applications there later; they hold the Video configuration, callback URL, application ID, and private key used by this Codespace.
If you created it only for this tutorial, you can delete it from the dashboard after you finish the guide.

The setup should finish with `Setup complete`.
It saves `.env` and prepares the Video application configuration for this Codespace.

> You only do this once for the whole Advanced path.
