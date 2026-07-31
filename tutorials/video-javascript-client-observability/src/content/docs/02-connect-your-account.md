---
title: Connect Your Account
description: Create the Video API application used by this Codespace.
---

The live session and the pre-call test need a Video API application. The setup script asks for your Vonage account API key and API secret, creates the application, and stores the generated Application ID and private key for this Codespace.

Open a new terminal from the bottom panel, using the plus icon or terminal menu, and run:

```sh
npm run setup-credentials
```

Enter your Vonage account API key and API secret when prompted. You can find them in the [Vonage Dashboard](https://dashboard.vonage.com/settings).

When setup finishes, open the **Ports** tab and select the **Forwarded Address** for port `3000`. This opens the Client Observability application. You will use the same Application URL later to validate the exercise in the Learning Path.
