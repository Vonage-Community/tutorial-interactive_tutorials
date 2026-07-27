import {
  correlateSupportCase,
  findSustainedIssues,
  normalizeTelemetry,
  summarizeSession
} from "./monitoring.js";
import {
  allFixtureRecords,
  platformSession,
  scenarios,
  supportReport
} from "./fixtures.js";

const COMPLETION_TOKEN = "VIDEO-BACKEND-OBSERVABILITY-COMPLETE";

export function getExerciseStatus() {
  const checks = [
    runCheck(
      "normalize",
      "Normalize telemetry with session context",
      validateNormalization
    ),
    runCheck(
      "summary",
      "Summarize publisher and subscriber samples",
      validateSummary
    ),
    runCheck(
      "alerts",
      "Detect a sustained quality issue",
      validateAlerts
    ),
    runCheck(
      "correlation",
      "Correlate a support report with platform data",
      validateCorrelation
    )
  ];
  const complete = checks.every((check) => check.complete);

  return {
    complete,
    checks,
    token: complete ? COMPLETION_TOKEN : null
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
    scenarios.baseline.records[0],
    receivedAt
  );

  return (
    normalized.eventId === "evt-001" &&
    normalized.sessionId === supportReport.sessionId &&
    normalized.source === "publisher" &&
    normalized.capturedAt === "2026-06-18T10:00:00.000Z" &&
    normalized.receivedAt === receivedAt &&
    normalized.sdk.platform === "web" &&
    normalized.metrics.videoBitrate === 820000 &&
    !Object.hasOwn(normalized, "privateDebugNote")
  );
}

function validateSummary() {
  const summary = summarizeSession(allFixtureRecords);

  return (
    summary.sessionId === supportReport.sessionId &&
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
  const isolated = findSustainedIssues(scenarios.isolated.records);
  const sustained = findSustainedIssues(scenarios.sustained.records);

  return (
    isolated.length === 0 &&
    sustained.length === 1 &&
    sustained[0].sessionId === supportReport.sessionId &&
    sustained[0].streamId === "stream-camera-alex" &&
    sustained[0].sampleCount === 3 &&
    sustained[0].reason === "packetLoss" &&
    sustained[0].degradationSource === "local"
  );
}

function validateCorrelation() {
  const result = correlateSupportCase(
    allFixtureRecords,
    supportReport,
    platformSession
  );

  return (
    result.caseId === supportReport.caseId &&
    result.telemetry.length === 3 &&
    result.platformSamples.length === 2 &&
    result.identifiers.connectionIds.length === 1 &&
    result.identifiers.connectionIds[0] === "conn-subscriber-sam" &&
    result.identifiers.streamIds.length === 1 &&
    result.identifiers.streamIds[0] === "stream-camera-alex"
  );
}
