---
title: Make Port 3000 Public
description: Expose port 3000 publicly in GitHub Codespaces so Vonage can reach your webhooks.
---

# Make Port 3000 Public

GitHub Codespaces automatically forwards port 3000, but it starts out as **private**. You need to make it public so that the Vonage API platform can reach your webhooks.

{% steps %}

1. Click the **Ports** tab at the bottom of VS Code (next to the Terminal tab).

2. Find port **3000** in the list.

3. Right-click the row and select **Port Visibility → Public**.

4. Copy the **Forwarded Address** URL — it will look like:
   ```
   https://<your-codespace-name>-3000.app.github.dev
   ```
   Keep this URL handy for the next step.

{% /steps %}

{% aside type="caution" %}
Your Codespace URL changes every time you create a new Codespace. If you rebuild your environment you will need to update the webhook URLs in your Vonage application.
{% /aside %}
