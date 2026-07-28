---
title: Correlate a Support Case
description: Match a user report with client telemetry from the same session and time window.
---

A support report provides a session, participant, and approximate time window. `correlateSupportCase()` selects only the records that match all three values, sorts them chronologically, and extracts the connection and stream IDs needed to inspect the same media path in Session Inspector.

In `project/src/monitoring.js`, find `correlateSupportCase()`. Replace the `TODO` comment inside the function with this code:

```js
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
  telemetry
};
```

This function does not query Inspector. It prepares the exact identifiers and time range an investigator uses to compare client telemetry with the platform record. Save the file, wait for the restart, and reload the Video Quality Monitor.
