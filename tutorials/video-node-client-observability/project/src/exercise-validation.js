import {
  correlateSupportCase,
  findSustainedIssues,
  normalizeTelemetry,
  summarizeSession
} from "./monitoring.js";

const SESSION_ID = "2_MX4xMDB-validation-session";

export function getExerciseStatus({
  appUrl,
  configured,
  liveSessionId,
  liveRecords
}) {
  const checks = [
    runCheck(
      "normalize",
      "Normalize telemetry with session context",
      validateNormalization
    ),
    runCheck(
      "summary",
      "Summarize publisher and subscriber records",
      validateSummary
    ),
    runCheck(
      "alerts",
      "Detect a sustained quality issue",
      validateAlerts
    ),
    runCheck(
      "correlation",
      "Match a support report to client telemetry",
      validateCorrelation
    ),
    {
      id: "live-session",
      label: "Receive telemetry from a live routed session",
      complete: validateLiveSession(configured, liveSessionId, liveRecords)
    }
  ];
  const complete = checks.every((check) => check.complete);

  return {
    complete,
    checks,
    credential: complete ? appUrl : null
  };
}

function runCheck(id, label, validate) {
  try {
    return {
      id,
      label,
      complete: Boolean(validate())
    };
  } catch {
    return {
      id,
      label,
      complete: false
    };
  }
}

function validateNormalization() {
  const receivedAt = "2026-06-18T10:00:02.000Z";
  const normalized = normalizeTelemetry(
    telemetry({
      eventId: "evt-001",
      source: "publisher",
      participantId: "publisher-demo",
      connectionId: "conn-publisher",
      condition: "good",
      videoBitrate: 820000
    }),
    receivedAt
  );

  return (
    normalized.eventId === "evt-001" &&
    normalized.sessionId === SESSION_ID &&
    normalized.source === "publisher" &&
    normalized.receivedAt === receivedAt &&
    normalized.sdk.platform === "web" &&
    normalized.metrics.videoBitrate === 820000 &&
    normalized.metrics.connectionEstimatedBandwidth === 1200000 &&
    normalized.metrics.videoWidth === 640 &&
    normalized.metrics.videoHeight === 360 &&
    !Object.hasOwn(normalized, "privateDebugNote")
  );
}

function validateSummary() {
  const records = validationRecords().map((record) =>
    normalizeTelemetry(record, record.capturedAt)
  );
  const summary = summarizeSession(records);

  return (
    summary.sessionId === SESSION_ID &&
    summary.sampleCount === 7 &&
    summary.publisherSamples === 1 &&
    summary.subscriberSamples === 6 &&
    summary.warningSamples === 4 &&
    summary.affectedStreams === 1 &&
    summary.latestCondition === "critical" &&
    summary.networkConditions.good === 3 &&
    summary.networkConditions.warning === 3 &&
    summary.networkConditions.critical === 1
  );
}

function validateAlerts() {
  const records = validationRecords();
  const isolated = findSustainedIssues(records.slice(1, 3));
  const sustained = findSustainedIssues(records.slice(4));

  return (
    isolated.length === 0 &&
    sustained.length === 1 &&
    sustained[0].sessionId === SESSION_ID &&
    sustained[0].streamId === "stream-camera" &&
    sustained[0].sampleCount === 3 &&
    sustained[0].reason === "packetLoss" &&
    sustained[0].degradationSource === "local"
  );
}

function validateCorrelation() {
  const records = validationRecords();
  const report = {
    caseId: "SUP-1042",
    sessionId: SESSION_ID,
    participantId: "subscriber-demo",
    from: "2026-06-18T10:03:55.000Z",
    to: "2026-06-18T10:04:10.000Z"
  };
  const result = correlateSupportCase(records, report);

  return (
    result.caseId === report.caseId &&
    result.telemetry.length === 3 &&
    result.identifiers.connectionIds.length === 1 &&
    result.identifiers.connectionIds[0] === "conn-subscriber" &&
    result.identifiers.streamIds.length === 1 &&
    result.identifiers.streamIds[0] === "stream-camera"
  );
}

function validateLiveSession(configured, sessionId, records) {
  if (!configured || !sessionId) {
    return false;
  }

  const matching = records.filter((record) => record.sessionId === sessionId);
  return (
    matching.some((record) => record.source === "publisher") &&
    matching.some((record) => record.source === "subscriber")
  );
}

function validationRecords() {
  return [
    telemetry({
      eventId: "evt-001",
      source: "publisher",
      participantId: "publisher-demo",
      connectionId: "conn-publisher",
      condition: "good",
      videoBitrate: 820000
    }),
    telemetry({
      eventId: "evt-002",
      seconds: 1,
      source: "subscriber",
      participantId: "subscriber-demo",
      connectionId: "conn-subscriber",
      condition: "warning",
      reason: "packetLoss",
      degradationSource: "local",
      videoBitrate: 310000
    }),
    telemetry({
      eventId: "evt-003",
      seconds: 2,
      source: "subscriber",
      participantId: "subscriber-demo",
      connectionId: "conn-subscriber",
      condition: "good",
      videoBitrate: 760000
    }),
    telemetry({
      eventId: "evt-004",
      seconds: 3,
      source: "subscriber",
      participantId: "subscriber-demo",
      connectionId: "conn-subscriber",
      condition: "good",
      videoBitrate: 740000
    }),
    telemetry({
      eventId: "evt-005",
      seconds: 240,
      source: "subscriber",
      participantId: "subscriber-demo",
      connectionId: "conn-subscriber",
      condition: "warning",
      reason: "packetLoss",
      degradationSource: "local",
      videoBitrate: 280000
    }),
    telemetry({
      eventId: "evt-006",
      seconds: 241,
      source: "subscriber",
      participantId: "subscriber-demo",
      connectionId: "conn-subscriber",
      condition: "warning",
      reason: "packetLoss",
      degradationSource: "local",
      videoBitrate: 230000
    }),
    telemetry({
      eventId: "evt-007",
      seconds: 242,
      source: "subscriber",
      participantId: "subscriber-demo",
      connectionId: "conn-subscriber",
      condition: "critical",
      reason: "packetLoss",
      degradationSource: "local",
      videoBitrate: 120000
    })
  ];
}

function telemetry({
  eventId,
  seconds = 0,
  source,
  participantId,
  connectionId,
  condition,
  reason = "none",
  degradationSource = "none",
  videoBitrate
}) {
  return {
    eventId,
    sessionId: SESSION_ID,
    connectionId,
    streamId: "stream-camera",
    participantId,
    source,
    mediaMode: "routed",
    sdk: {
      platform: "web",
      version: "2.33.0"
    },
    capturedAt: new Date(
      Date.parse("2026-06-18T10:00:00.000Z") + seconds * 1000
    ).toISOString(),
    metrics: {
      networkCondition: condition,
      networkConditionReason: reason,
      networkDegradationSource: degradationSource,
      connectionEstimatedBandwidth: 1200000,
      videoBitrate,
      videoWidth: 640,
      videoHeight: 360,
      encodedFrameRate: source === "publisher" ? 30 : null,
      decodedFrameRate: source === "subscriber" ? 30 : null,
      freezeCount: 0,
      totalFreezesDuration: 0,
      pauseCount: 0,
      totalPausesDuration: 0,
      senderEstimatedBandwidth:
        source === "subscriber" ? 1100000 : null,
      scalabilityMode: source === "publisher" ? "L3T3" : null,
      qualityLimitationReason: "none"
    },
    privateDebugNote: "This field must not be stored."
  };
}
