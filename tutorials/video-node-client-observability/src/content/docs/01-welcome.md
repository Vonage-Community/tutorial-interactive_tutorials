---
title: Welcome
description: Build a backend that processes telemetry from a live Vonage Video API session.
---

# Build a Video Quality Monitor

In this exercise, you will complete the backend logic for a small Video API quality monitor. A prepared web client will create a **live routed session**, publish a video stream, subscribe to that stream through a second connection, and send both sets of statistics to your backend.

You will implement the functions that:

- Normalize publisher and subscriber records before storing them.
- Summarize quality across a session.
- Report a problem only when it continues across several records.
- Match a support report with telemetry from the same participant and time.

You will connect the Codespace to your Vonage account, run the completed monitor with real client telemetry, and use the resulting Session ID to find the session in Inspector.
