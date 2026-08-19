---
title: Copy Server URL
description: Copy the public Codespace URL for your Voice API webhooks.
---

# Copy Server URL

The Codespace configures port `3000` as public so that Vonage can reach your webhooks.

In the **Ports** tab:

1. Find port `3000`.
2. Confirm its visibility is **Public**. If it is not, right-click the row and select **Port Visibility > Public**.
3. Copy the **Forwarded Address** URL.

It will look like this:

```text
https://<your-codespace-name>-3000.app.github.dev
```

You will use this address when you configure your Vonage Voice Application.
