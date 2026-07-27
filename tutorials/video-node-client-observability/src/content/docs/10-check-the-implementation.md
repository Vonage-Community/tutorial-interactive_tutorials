---
title: Check the Implementation
description: Confirm that the four backend functions pass their deterministic checks.
---

# Check the Implementation

Return to the **Video Quality Monitor**. The first four checks should now be green:

- Normalize telemetry with session context.
- Summarize publisher and subscriber records.
- Detect a sustained quality issue.
- Match a support report to client telemetry.

The alert check uses a small fixed set of validation records because a healthy live connection may never produce three consecutive Warning or Critical conditions. These records test the alert rule only; the final check still requires a real Video API session and live telemetry.

The **Receive telemetry from a live routed session** check remains incomplete until you start the session.
