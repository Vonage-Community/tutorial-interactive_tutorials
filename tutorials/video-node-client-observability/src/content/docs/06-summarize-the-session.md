---
title: Summarize the Session
description: Aggregate client records into session-level quality information.
---

`summarizeSession()` turns individual telemetry records into a session-level view. It counts publisher and subscriber records separately, identifies streams with Warning or Critical conditions, groups quality limitations, and keeps the latest network condition for the monitor.

In `project/src/monitoring.js`, find `summarizeSession()`. Replace the `TODO` comment inside the function with this code:

```js
if (records.length === 0) {
  return {
    sessionId: null,
    sampleCount: 0,
    publisherSamples: 0,
    subscriberSamples: 0,
    warningSamples: 0,
    affectedStreams: 0,
    latestCondition: "unknown",
    networkConditions: {},
    qualityLimitations: {}
  };
}

const sorted = [...records].sort(compareByCapturedAt);
const networkConditions = {};
const qualityLimitations = {};
const affectedStreams = new Set();
let publisherSamples = 0;
let subscriberSamples = 0;
let warningSamples = 0;

for (const record of sorted) {
  const condition = readCondition(record);
  networkConditions[condition] = (networkConditions[condition] ?? 0) + 1;

  if (record.source === "publisher") {
    publisherSamples += 1;
  } else if (record.source === "subscriber") {
    subscriberSamples += 1;
  }

  if (isUnhealthy(record)) {
    warningSamples += 1;
    affectedStreams.add(record.streamId);
  }

  const limitation = record.metrics?.qualityLimitationReason;
  if (limitation && limitation !== "none") {
    qualityLimitations[limitation] =
      (qualityLimitations[limitation] ?? 0) + 1;
  }
}

return {
  sessionId: sorted[0].sessionId,
  sampleCount: sorted.length,
  publisherSamples,
  subscriberSamples,
  warningSamples,
  affectedStreams: affectedStreams.size,
  latestCondition: readCondition(sorted.at(-1)),
  networkConditions,
  qualityLimitations
};
```

Save the file, wait for the restart, and reload the Video Quality Monitor. The second check confirms that the summary keeps publisher and subscriber data separate.
