---
title: Detect Sustained Issues
description: Require consecutive unhealthy samples before creating an alert.
---

# Detect Sustained Issues

Periodic measurements can change from one sample to the next. Group records by client, stream, and source, then require three consecutive `warning` or `critical` conditions.

Replace the `findSustainedIssues()` function with:

```js
export function findSustainedIssues(records, minimumSamples = 3) {
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
}
```

Healthy samples reset the streak for that client and stream. An earlier warning does not make a later, unrelated warning look continuous.

Save the file. The third check tests both an isolated warning and a sustained issue.
