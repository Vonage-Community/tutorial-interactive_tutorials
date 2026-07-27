---
title: Summarize the Session
description: Aggregate client samples into session-level quality information.
---

# Summarize the Session

A dashboard should describe the session, not make an operator count individual callbacks. The summary will separate publisher and subscriber records and count unhealthy samples and affected streams.

Replace the `summarizeSession()` function with:

```js
export function summarizeSession(records) {
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
}
```

Save the file. The second check confirms that the summary keeps publisher and subscriber measurements separate.

The monitor can now present session-level totals.
