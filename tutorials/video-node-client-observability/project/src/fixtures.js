const SESSION_ID = "2_MX4xMDB-client-observability-demo";
const PUBLISHER_CONNECTION_ID = "conn-publisher-alex";
const SUBSCRIBER_CONNECTION_ID = "conn-subscriber-sam";
const STREAM_ID = "stream-camera-alex";

function telemetry({
  eventId,
  capturedAt,
  source,
  participantId,
  connectionId,
  condition,
  reason = "none",
  degradationSource = "none",
  videoBitrate,
  decodedFrameRate = null,
  freezeCount = 0,
  qualityLimitationReason = null
}) {
  return {
    eventId,
    sessionId: SESSION_ID,
    connectionId,
    streamId: STREAM_ID,
    participantId,
    source,
    mediaMode: "routed",
    sdk: {
      platform: "web",
      version: "2.33.0"
    },
    capturedAt,
    metrics: {
      networkCondition: condition,
      networkConditionReason: reason,
      networkDegradationSource: degradationSource,
      videoBitrate,
      decodedFrameRate,
      freezeCount,
      qualityLimitationReason
    },
    privateDebugNote: "This field must not be stored."
  };
}

export const scenarios = {
  baseline: {
    id: "baseline",
    name: "Healthy baseline",
    description: "Publisher and subscriber samples under normal conditions.",
    records: [
      telemetry({
        eventId: "evt-001",
        capturedAt: "2026-06-18T10:00:00.000Z",
        source: "publisher",
        participantId: "participant-alex",
        connectionId: PUBLISHER_CONNECTION_ID,
        condition: "good",
        videoBitrate: 820000,
        qualityLimitationReason: "none"
      }),
      telemetry({
        eventId: "evt-002",
        capturedAt: "2026-06-18T10:00:01.000Z",
        source: "subscriber",
        participantId: "participant-sam",
        connectionId: SUBSCRIBER_CONNECTION_ID,
        condition: "good",
        videoBitrate: 790000,
        decodedFrameRate: 30
      })
    ]
  },
  isolated: {
    id: "isolated",
    name: "Isolated warning",
    description: "One warning followed by a return to good network conditions.",
    records: [
      telemetry({
        eventId: "evt-003",
        capturedAt: "2026-06-18T10:02:00.000Z",
        source: "subscriber",
        participantId: "participant-sam",
        connectionId: SUBSCRIBER_CONNECTION_ID,
        condition: "warning",
        reason: "packetLoss",
        degradationSource: "local",
        videoBitrate: 310000,
        decodedFrameRate: 18,
        freezeCount: 1
      }),
      telemetry({
        eventId: "evt-004",
        capturedAt: "2026-06-18T10:02:01.000Z",
        source: "subscriber",
        participantId: "participant-sam",
        connectionId: SUBSCRIBER_CONNECTION_ID,
        condition: "good",
        videoBitrate: 760000,
        decodedFrameRate: 30,
        freezeCount: 1
      })
    ]
  },
  sustained: {
    id: "sustained",
    name: "Sustained subscriber issue",
    description: "Three consecutive unhealthy samples from one subscriber.",
    records: [
      telemetry({
        eventId: "evt-005",
        capturedAt: "2026-06-18T10:04:00.000Z",
        source: "subscriber",
        participantId: "participant-sam",
        connectionId: SUBSCRIBER_CONNECTION_ID,
        condition: "warning",
        reason: "packetLoss",
        degradationSource: "local",
        videoBitrate: 280000,
        decodedFrameRate: 16,
        freezeCount: 2
      }),
      telemetry({
        eventId: "evt-006",
        capturedAt: "2026-06-18T10:04:01.000Z",
        source: "subscriber",
        participantId: "participant-sam",
        connectionId: SUBSCRIBER_CONNECTION_ID,
        condition: "warning",
        reason: "packetLoss",
        degradationSource: "local",
        videoBitrate: 230000,
        decodedFrameRate: 12,
        freezeCount: 3
      }),
      telemetry({
        eventId: "evt-007",
        capturedAt: "2026-06-18T10:04:02.000Z",
        source: "subscriber",
        participantId: "participant-sam",
        connectionId: SUBSCRIBER_CONNECTION_ID,
        condition: "critical",
        reason: "packetLoss",
        degradationSource: "local",
        videoBitrate: 120000,
        decodedFrameRate: 7,
        freezeCount: 5
      })
    ]
  }
};

export const supportReport = {
  caseId: "SUP-1042",
  sessionId: SESSION_ID,
  participantId: "participant-sam",
  from: "2026-06-18T10:03:55.000Z",
  to: "2026-06-18T10:04:10.000Z",
  summary: "The remote video froze several times."
};

export const platformSession = {
  sessionId: SESSION_ID,
  meetingId: "meeting-2026-06-18-01",
  qualitySamples: [
    {
      at: "2026-06-18T10:00:00.000Z",
      connectionId: PUBLISHER_CONNECTION_ID,
      streamId: STREAM_ID,
      videoBitrate: 820000,
      videoPacketLossRatio: 0.002,
      videoLatency: 82
    },
    {
      at: "2026-06-18T10:04:01.500Z",
      connectionId: SUBSCRIBER_CONNECTION_ID,
      streamId: STREAM_ID,
      videoBitrate: 240000,
      videoPacketLossRatio: 0.041,
      videoLatency: 238
    },
    {
      at: "2026-06-18T10:04:03.000Z",
      connectionId: SUBSCRIBER_CONNECTION_ID,
      streamId: STREAM_ID,
      videoBitrate: 135000,
      videoPacketLossRatio: 0.078,
      videoLatency: 326
    },
    {
      at: "2026-06-18T10:10:00.000Z",
      connectionId: PUBLISHER_CONNECTION_ID,
      streamId: STREAM_ID,
      videoBitrate: 780000,
      videoPacketLossRatio: 0.004,
      videoLatency: 91
    }
  ]
};

export const allFixtureRecords = Object.values(scenarios).flatMap(
  (scenario) => scenario.records
);
