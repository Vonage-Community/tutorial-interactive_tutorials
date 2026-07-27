---
title: Normalize Client Telemetry
description: Keep the identifiers and measurements needed for later investigation.
---

# Normalize Client Telemetry

A useful record needs both Video API identifiers and application context. It should also keep the client timestamp separate from the time the backend received the data.

Replace the `normalizeTelemetry()` function with:

```js
export function normalizeTelemetry(payload, receivedAt = new Date().toISOString()) {
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
      videoBitrate: numberOrNull(metrics.videoBitrate),
      decodedFrameRate: numberOrNull(metrics.decodedFrameRate),
      freezeCount: numberOrNull(metrics.freezeCount),
      qualityLimitationReason: metrics.qualityLimitationReason ?? null
    }
  };
}
```

The explicit return object acts as an allowlist. Debug fields or other unexpected client data are not copied into storage.

Save the file. The first exercise check should turn green after the server restarts.
