---
title: Review Live Telemetry
description: Confirm that the backend stores and summarizes statistics from both clients.
---

Keep the session running for several seconds. The Video Quality Monitor should now show **at least two stored records**: one from the publisher and one from the subscriber. The count continues to increase while the session runs.

The session summary should show:

- Publisher and subscriber records.
- The latest network condition reported by the SDK.
- Any Warning or Critical records.
- The number of affected streams.

The table keeps each record with its source, condition, reason, and video bitrate. The **Session ID** shown above the summary belongs to the real session created for this run.

The final exercise check turns green after the backend receives at least one publisher record and one subscriber record.
