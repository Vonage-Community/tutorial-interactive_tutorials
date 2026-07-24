---
title: Test the Call Menu
description: Call your Vonage number and test the IVR menu.
---

# Test the Call Menu

With your server running and your Vonage application configured, it is time to test the IVR.

{% steps %}

1. Call your Vonage virtual number from your phone.

2. You should hear:
   > *"Welcome. Press 1 to hear the current date. Press any other key to hear these options again."*

3. Press **1**. The server reads the current date and time aloud, then replays the menu.

4. Press any other key. The menu repeats.

{% /steps %}

{% aside type="caution" %}
If the call does not connect or you hear an error, check:
- The server is still running in the terminal.
- Port 3000 is still set to **Public** in the Ports tab.
- The Answer URL and Event URL in your Vonage Dashboard are correct and match your current Codespace URL.
- Your Vonage virtual number is linked to the Voice Application you configured.
{% /aside %}

You can watch incoming events in the terminal — the event webhook logs each `req.body` to the console.
