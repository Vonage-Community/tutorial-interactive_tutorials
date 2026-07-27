---
title: Run the Baseline
description: Send healthy publisher and subscriber records through the backend.
---

# Run the Baseline

Return to the **Preview** tab and select **Healthy baseline**. The backend receives one publisher record and one subscriber record.

The records table should show:

- `good` for both network conditions,
- `none` as the reason,
- separate publisher and subscriber sources,
- the video bitrate reported by each client.

The session totals are still incomplete because `summarizeSession()` has not been implemented.

You now have normalized client telemetry in the in-memory store.
