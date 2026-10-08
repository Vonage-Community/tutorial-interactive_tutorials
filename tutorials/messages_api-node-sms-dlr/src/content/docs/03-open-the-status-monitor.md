---
title: Open the Status Monitor
description: Open the Codespace application and find its public status webhook URL.
---

The Simple Browser displays this exercise guide. The **SMS Status Monitor** is a separate application running on port `3000`.

Open the `APPLICATION READY` URL printed in the initial terminal. If port `3000` appears in the **Ports** tab, you can also open its **Forwarded Address**.

The monitor displays a **Status webhook URL** ending in `/webhooks/status`. Copy the complete URL for the next step. Port `3000` is public so Vonage can send callbacks to the Codespace.
