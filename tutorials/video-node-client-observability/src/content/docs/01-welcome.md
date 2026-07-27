---
title: Welcome
description: Build a backend that turns Video API client telemetry into session summaries, alerts, and support evidence.
---

# Build a Video Quality Monitor

Client telemetry is most useful after a call when it is stored with enough context to identify the session, participant, and stream. In this exercise, you will complete the backend logic for a small Video API quality monitor.

The finished monitor will:

- Store normalized publisher and subscriber records.
- Summarize quality across a session.
- Report a problem only when it continues across several samples.
- Match a support report with client telemetry and platform quality data.

The Codespace includes prepared telemetry, so you can test each workflow without waiting for Insights data from a live application.

By the end, the monitor will turn individual client measurements into evidence that can be used by support and operations teams.
