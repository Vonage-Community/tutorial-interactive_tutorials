---
title: Correlate a Support Case
description: Match a user report with telemetry and platform quality data from the same time window.
---

# Correlate a Support Case

A support report normally starts with a session, participant, and approximate time. Use those values to select client records, then match their connection and stream IDs with platform quality samples.

Replace the `correlateSupportCase()` function with:

```js
export function correlateSupportCase(records, report, platformSession) {
  const telemetry = records
    .filter((record) =>
      record.sessionId === report.sessionId &&
      record.participantId === report.participantId &&
      isWithinTimeWindow(record.capturedAt, report.from, report.to)
    )
    .sort(compareByCapturedAt);

  const connectionIds = [
    ...new Set(telemetry.map((record) => record.connectionId))
  ];
  const streamIds = [
    ...new Set(telemetry.map((record) => record.streamId))
  ];

  const platformSamples = platformSession.sessionId === report.sessionId
    ? platformSession.qualitySamples.filter((sample) => {
        const matchesTime = isWithinTimeWindow(
          sample.at,
          report.from,
          report.to
        );
        const matchesConnection =
          sample.connectionId &&
          connectionIds.includes(sample.connectionId);
        const matchesStream =
          sample.streamId && streamIds.includes(sample.streamId);
        return matchesTime && (matchesConnection || matchesStream);
      })
    : [];

  return {
    caseId: report.caseId,
    sessionId: report.sessionId,
    timeWindow: {
      from: report.from,
      to: report.to
    },
    identifiers: {
      connectionIds,
      streamIds
    },
    telemetry,
    platformSamples
  };
}
```

The result preserves evidence instead of generating a diagnosis from one metric. An investigator can compare the same participant, stream, and time with bitrate, packet loss, and latency in Inspector.

Save the file. The fourth check verifies the complete correlation.
