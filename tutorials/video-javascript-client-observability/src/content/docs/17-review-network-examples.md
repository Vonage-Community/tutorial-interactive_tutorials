---
title: Compare Degradation Sources
description: Confirm how local and remote Subscriber degradation is reported.
---

# Compare Degradation Sources

At the bottom of the application, select each degradation example:

- **Local downlink issue** shows a problem on the subscriber's connection.
- **Remote publisher issue** points to the participant sending the stream.
- **Both or unclear** keeps both conditions visible when the SDK cannot identify one side.

These prepared records call the same `readSubscriberNetwork()` function used by live Subscriber statistics and events. They confirm how the application presents each value without deliberately degrading a connection. They do not replace the live telemetry check.
