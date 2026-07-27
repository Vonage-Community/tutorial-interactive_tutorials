---
title: Test Live Monitoring
description: Join a routed session and review publisher and subscriber data.
---

# Test Live Monitoring

After a `Pass` or `Warn` result, select **Join call**. The Publisher panel should show your camera and the publisher statistics should begin updating.

To add a Subscriber:

1. Return to the **Ports** tab and copy the **Forwarded Address** for port `3000`.
2. Open that address in another browser window.
3. Complete the pre-call test in the second window.
4. Keep the same room name, `observability-room`.
5. Select **Join call** in the second window.

Both windows use the application and credentials already configured in this Codespace. When the second participant publishes, the first window subscribes to that stream and begins showing Subscriber statistics. Look for video bitrate, decoded frame rate, freeze count, the local network condition, and the remote sender bandwidth.

The **Collect live Publisher and Subscriber statistics** check completes when the application receives both types of statistics for the same routed session.

Quality events may remain empty on a healthy connection. They are emitted only when the SDK detects a meaningful change.
