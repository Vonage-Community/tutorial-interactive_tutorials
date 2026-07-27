const VALID_SOURCES = new Set(["publisher", "subscriber"]);
const UNHEALTHY_CONDITIONS = new Set(["warning", "critical"]);

export function normalizeTelemetry(payload, receivedAt = new Date().toISOString()) {
  // TODO: Normalize a telemetry record
  return {
    ...payload,
    receivedAt
  };
}

export function summarizeSession(records) {
  // TODO: Summarize a session
  return {
    sessionId: records[0]?.sessionId ?? null,
    sampleCount: records.length,
    publisherSamples: 0,
    subscriberSamples: 0,
    warningSamples: 0,
    affectedStreams: 0,
    latestCondition: "unknown",
    networkConditions: {},
    qualityLimitations: {}
  };
}

export function findSustainedIssues(records, minimumSamples = 3) {
  // TODO: Detect sustained quality issues
  return [];
}

export function correlateSupportCase(records, report, platformSession) {
  // TODO: Correlate a support case
  return {
    caseId: report.caseId,
    sessionId: report.sessionId,
    timeWindow: {
      from: report.from,
      to: report.to
    },
    identifiers: {
      connectionIds: [],
      streamIds: []
    },
    telemetry: [],
    platformSamples: []
  };
}

export function readCondition(record) {
  return record.metrics?.networkCondition ?? "unknown";
}

export function isUnhealthy(record) {
  return UNHEALTHY_CONDITIONS.has(readCondition(record));
}

export function isValidSource(source) {
  return VALID_SOURCES.has(source);
}

export function compareByCapturedAt(left, right) {
  return Date.parse(left.capturedAt) - Date.parse(right.capturedAt);
}

export function isWithinTimeWindow(timestamp, from, to) {
  const value = Date.parse(timestamp);
  return value >= Date.parse(from) && value <= Date.parse(to);
}
