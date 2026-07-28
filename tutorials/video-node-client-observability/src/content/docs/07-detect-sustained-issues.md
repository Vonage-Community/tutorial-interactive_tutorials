---
title: Detect Sustained Issues
description: Require consecutive unhealthy records before creating an alert.
---

One Warning callback is useful session history, but it is not enough to notify an operations team. `findSustainedIssues()` tracks each session, connection, stream, and source independently and creates an alert only after three consecutive Warning or Critical records. A healthy record resets that sequence.

In `project/src/monitoring.js`, find `findSustainedIssues()`. Replace the `TODO` comment inside the function with this code:

```js
const sorted = [...records].sort(compareByCapturedAt);
const streaks = new Map();
const alerts = new Map();

for (const record of sorted) {
  const key = [
    record.sessionId,
    record.connectionId,
    record.streamId,
    record.source
  ].join(":");

  if (!isUnhealthy(record)) {
    streaks.delete(key);
    continue;
  }

  const previous = streaks.get(key);
  const current = {
    sampleCount: (previous?.sampleCount ?? 0) + 1,
    startedAt: previous?.startedAt ?? record.capturedAt,
    lastSeenAt: record.capturedAt
  };
  streaks.set(key, current);

  if (current.sampleCount >= minimumSamples) {
    alerts.set(key, {
      sessionId: record.sessionId,
      connectionId: record.connectionId,
      streamId: record.streamId,
      participantId: record.participantId,
      source: record.source,
      condition: readCondition(record),
      reason: record.metrics?.networkConditionReason ?? "unknown",
      degradationSource:
        record.metrics?.networkDegradationSource ?? "none",
      sampleCount: current.sampleCount,
      startedAt: current.startedAt,
      lastSeenAt: current.lastSeenAt
    });
  }
}

return [...alerts.values()];
```

The compound key prevents unrelated publisher and subscriber records from being combined into one alert. Save the file, wait for the restart, and reload the Video Quality Monitor.
