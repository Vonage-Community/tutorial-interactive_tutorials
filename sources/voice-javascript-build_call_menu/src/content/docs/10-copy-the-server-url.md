---
title: Copy the Server URL
description: Confirm that port 3000 is public and copy its forwarded address.
---

# Copy the Server URL

The Codespace configures port **3000** as public so that the Vonage API platform can reach your webhooks. Confirm its visibility and copy its address before configuring your Vonage application.

{% steps %}

1. Click the **Ports** tab at the bottom of VS Code (next to the Terminal tab).

2. Find port **3000** in the list.

3. Check that its visibility is **Public**. If it is not, right-click the row and select **Port Visibility → Public**.

4. Copy the **Forwarded Address** URL — it will look like:
   ```
   https://<your-codespace-name>-3000.app.github.dev
   ```
   You will use this URL in the next step.

{% /steps %}

{% aside type="caution" %}
Your Codespace URL changes every time you create a new Codespace. If you rebuild your environment you will need to update the webhook URLs in your Vonage application.
{% /aside %}
