---
title: Normalize Client Telemetry
description: Keep the identifiers and measurements needed for later investigation.
---

# Normalize Client Telemetry

A telemetry endpoint should not store an arbitrary browser payload. `normalizeTelemetry()` validates the required session, connection, stream, participant, and source fields, converts both timestamps to ISO format, and returns only the fields used by the monitor.

In `project/src/monitoring.js`, find `normalizeTelemetry()`. Delete the `TODO` comment and the entire placeholder `return` block, but keep the function declaration and its braces. Paste this code inside the function:

```js
if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
  throw new TypeError("Telemetry must be an object.");
}

const requiredFields = [
  "eventId",
  "sessionId",
  "connectionId",
  "streamId",
  "participantId",
  "source",
  "capturedAt"
];

for (const field of requiredFields) {
  if (typeof payload[field] !== "string" || payload[field].length === 0) {
    throw new TypeError(`Telemetry is missing ${field}.`);
  }
}

if (!isValidSource(payload.source)) {
  throw new TypeError("Telemetry source must be publisher or subscriber.");
}

const capturedAt = new Date(payload.capturedAt);
const received = new Date(receivedAt);
if (Number.isNaN(capturedAt.valueOf()) || Number.isNaN(received.valueOf())) {
  throw new TypeError("Telemetry timestamps must be valid dates.");
}

const metrics = payload.metrics ?? {};
const numberOrNull = (value) => Number.isFinite(value) ? value : null;

return {
  eventId: payload.eventId,
  sessionId: payload.sessionId,
  connectionId: payload.connectionId,
  streamId: payload.streamId,
  participantId: payload.participantId,
  source: payload.source,
  mediaMode: payload.mediaMode ?? "unknown",
  sdk: {
    platform: payload.sdk?.platform ?? "unknown",
    version: payload.sdk?.version ?? "unknown"
  },
  capturedAt: capturedAt.toISOString(),
  receivedAt: received.toISOString(),
  metrics: {
    networkCondition: metrics.networkCondition ?? "unknown",
    networkConditionReason: metrics.networkConditionReason ?? "unknown",
    networkDegradationSource: metrics.networkDegradationSource ?? "none",
    connectionEstimatedBandwidth:
      numberOrNull(metrics.connectionEstimatedBandwidth),
    videoBitrate: numberOrNull(metrics.videoBitrate),
    videoWidth: numberOrNull(metrics.videoWidth),
    videoHeight: numberOrNull(metrics.videoHeight),
    encodedFrameRate: numberOrNull(metrics.encodedFrameRate),
    decodedFrameRate: numberOrNull(metrics.decodedFrameRate),
    freezeCount: numberOrNull(metrics.freezeCount),
    totalFreezesDuration: numberOrNull(metrics.totalFreezesDuration),
    pauseCount: numberOrNull(metrics.pauseCount),
    totalPausesDuration: numberOrNull(metrics.totalPausesDuration),
    senderEstimatedBandwidth:
      numberOrNull(metrics.senderEstimatedBandwidth),
    scalabilityMode: metrics.scalabilityMode ?? null,
    qualityLimitationReason: metrics.qualityLimitationReason ?? null
  }
};
```

The returned object is an allowlist: unexpected client fields are discarded before the record reaches the store. It retains the network condition, available bandwidth, active video layer, frame rate, and freeze or pause history needed for later analysis. The separate `capturedAt` and `receivedAt` values preserve client time without losing the backend receipt time.

Save the file, wait for the server to restart, and reload the Video Quality Monitor. The normalization check should turn green.
