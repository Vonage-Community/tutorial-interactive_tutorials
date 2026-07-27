---
title: Connect Your Account
description: Create the Video API application used by this Codespace.
---

# Connect Your Vonage Account

The live session and the network test need a Video API application. The prepared setup script uses your account credentials to create one, then stores its Application ID and private key in the Codespace.

Open a terminal and run:

```sh
cd project && npm run setup-credentials
```

Enter your Vonage account API key and API secret when prompted. You can find them in the [Vonage Dashboard](https://dashboard.vonage.com/settings).

Return to the **Client Observability** application and select **Check setup**. The account notice disappears when the application is ready.

> The account API secret is used only while the application is created and is not written to `project/.env`. Do not commit the generated `.env` file because it contains the application private key.
