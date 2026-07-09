---
title: "Review setup URLs"
description: "Workspace setup"
---

Before you return to Learning Center, take a look at the terminal output from the setup script.
It prints two URLs:

```text
Application URL: https://<codespace-name>-3000.app.github.dev
Video callback URL: https://<codespace-name>-3000.app.github.dev/callbacks/video
```

The `Application URL` is the important one for this guide.
It opens the basic Video application that you will use throughout the learning path.
As you complete each exercise, this same app will gain debugging, signaling, publisher tuning, subscriber quality, recording layout, and archiving features.

Open the `Application URL` now and take a quick look.
Most feature panels will not work yet because you will implement them step by step.
You will use this same URL in the next step when you return to Learning Center.

The `Video callback URL` is registered on the Vonage Video application created by the setup script.
Vonage sends Video callback events to that endpoint, but you do not need to open it in the browser.
