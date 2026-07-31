---
title: Test Live Monitoring
description: Join a routed session and review publisher and subscriber data.
---

After a `Pass` or `Warn` result, select **Join call**. The Publisher panel should show your camera and the Publisher statistics should begin updating.

Open your app in another window and join the same room to add a Subscriber. To do this, copy the Application URL and paste it into another browser tab.

Complete the pre-call test in the second window.

- Keep the same room name, `observability-room`.
- Select **Join call** in the second window.

When the second participant publishes, the first window subscribes to that stream and begins showing Subscriber statistics. The **Collect live Publisher and Subscriber statistics** check completes when the application receives both types of statistics for the same routed session.
