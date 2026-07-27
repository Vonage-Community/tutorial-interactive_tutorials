---
title: Test the Waiting Room
description: Run the real connectivity and quality checks with the selected devices.
---

# Test the Waiting Room

Return to the **Client Observability** application and complete the pre-call flow:

1. Select **Check devices** and allow camera and microphone access.
2. Choose the camera and microphone you want to test.
3. Select **Run pre-call test**.
4. Wait for the connectivity and quality results.
5. Review the join status and recommended video settings.

The quality stage runs for about ten seconds in this exercise. Its result depends on the current browser, devices, and network, so your bitrate and recommendation may differ.

> `testQuality()` is not supported in Firefox. Use a Chromium-based browser or Safari to run the complete exercise.

When the test finishes, the **Complete a pre-call test in a separate routed session** check should be complete. A `Pass` or `Warn` result enables **Join call**. If the result is `Fail`, follow the reason shown in the waiting room and run the test again.
