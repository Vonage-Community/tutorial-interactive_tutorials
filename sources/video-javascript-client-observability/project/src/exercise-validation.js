import {
  getPublisherOptions,
  observeQualityChanges,
  readSubscriberNetwork,
  startPublisherStats,
  startSubscriberStats
} from "../public/client-observability.js";
import {
  getPreCallStatus,
  getRecommendedPublisherOptions,
  runPreCallTest
} from "../public/pre-call.js";

export async function getExerciseStatus({
  appUrl = null,
  configured = false,
  activity = {}
} = {}) {
  const checks = [
    runCheck(
      "sender-stats",
      "Enable and collect publisher statistics",
      validatePublisherStats
    ),
    runCheck(
      "subscriber-stats",
      "Collect subscriber statistics",
      validateSubscriberStats
    ),
    runCheck(
      "quality-events",
      "Listen for quality and network changes",
      validateQualityEvents
    ),
    runCheck(
      "degradation-source",
      "Identify local and remote degradation",
      validateDegradationSource
    ),
    await runAsyncCheck(
      "pre-call-order",
      "Run connectivity before the quality test",
      validatePreCallOrder
    ),
    runCheck(
      "join-status",
      "Return Pass, Warn, and Fail decisions",
      validatePreCallStatuses
    ),
    runCheck(
      "publish-settings",
      "Apply the recommended publish settings",
      validateRecommendedSettings
    ),
    {
      id: "pre-call-live",
      label: "Complete a pre-call test in a separate routed session",
      complete: validatePreCallActivity(configured, activity)
    },
    {
      id: "live-telemetry",
      label: "Collect live Publisher and Subscriber statistics",
      complete: validateLiveTelemetry(activity)
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

async function runAsyncCheck(id, label, validate) {
  try {
    return {
      id,
      label,
      complete: Boolean(await validate())
    };
  } catch {
    return {
      id,
      label,
      complete: false
    };
  }
}

function validatePublisherStats() {
  const options = getPublisherOptions();
  let sample;
  let calls = 0;
  const publisher = {
    getStats(callback) {
      calls += 1;
      callback(null, [
        {
          stats: {
            mediaLink: {
              transport: {
                networkCondition: "good"
              }
            }
          }
        }
      ]);
    }
  };

  const stop = startPublisherStats(publisher, (value) => {
    sample = value;
  });
  stop();

  return (
    options.publishSenderStats === true &&
    calls >= 1 &&
    sample?.source === "publisher" &&
    sample.stats.mediaLink.transport.networkCondition === "good"
  );
}

function validateSubscriberStats() {
  let sample;
  let calls = 0;
  const subscriber = {
    getStats(callback) {
      calls += 1;
      callback(null, {
        video: {
          bitrate: 640000
        }
      });
    }
  };

  const stop = startSubscriberStats(subscriber, (value) => {
    sample = value;
  });
  stop();

  return (
    calls >= 1 &&
    sample?.source === "subscriber" &&
    sample.stats.video.bitrate === 640000
  );
}

function validateQualityEvents() {
  const handlers = new Map();
  const removed = [];
  const events = [];
  const target = {
    on(name, handler) {
      handlers.set(name, handler);
    },
    off(name, handler) {
      if (handlers.get(name) === handler) {
        removed.push(name);
      }
    }
  };

  const stop = observeQualityChanges(target, "subscriber", (event) => {
    events.push(event);
  });

  handlers.get("videoQualityChanged")?.({
    reason: "videoInterruption",
    stats: { video: { freezeCount: 1 } }
  });
  handlers.get("networkConditionChanged")?.({
    reason: "packetLoss",
    stats: {
      mediaLink: {
        networkDegradationSource: "local"
      }
    }
  });
  stop();

  return (
    events.length === 2 &&
    events[0].source === "subscriber" &&
    events[0].type === "videoQualityChanged" &&
    events[1].type === "networkConditionChanged" &&
    removed.includes("videoQualityChanged") &&
    removed.includes("networkConditionChanged")
  );
}

function validateDegradationSource() {
  const local = readSubscriberNetwork({
    mediaLink: {
      networkDegradationSource: "local",
      transport: { networkCondition: "critical" },
      remotePublisherTransport: { networkCondition: "good" }
    }
  });
  const remote = readSubscriberNetwork({
    mediaLink: {
      networkDegradationSource: "remote",
      transport: { networkCondition: "good" },
      remotePublisherTransport: { networkCondition: "warning" }
    }
  });

  return (
    local.source === "local" &&
    local.localCondition === "critical" &&
    local.remoteCondition === "good" &&
    remote.source === "remote" &&
    remote.localCondition === "good" &&
    remote.remoteCondition === "warning"
  );
}

async function validatePreCallOrder() {
  const calls = [];

  class FakeNetworkTest {
    constructor(OT, sessionInfo, options) {
      calls.push(["constructor", OT, sessionInfo, options]);
    }

    async testConnectivity() {
      calls.push(["connectivity"]);
      return { success: true };
    }

    async testQuality(onUpdate) {
      calls.push(["quality"]);
      onUpdate?.({ audio: { packetsLost: 0 } });
      return passingQuality();
    }
  }

  const result = await runPreCallTest({
    OT: { name: "OT" },
    NetworkTest: FakeNetworkTest,
    sessionInfo: {
      applicationId: "app-id",
      sessionId: "test-session",
      token: "test-token"
    },
    audioSource: "microphone-1",
    videoSource: "camera-1",
    onUpdate: () => {}
  });

  return (
    calls[0][0] === "constructor" &&
    calls[0][3].timeout === 10000 &&
    calls[0][3].audioSource === "microphone-1" &&
    calls[0][3].videoSource === "camera-1" &&
    calls[1][0] === "connectivity" &&
    calls[2][0] === "quality" &&
    result.connectivity.success === true &&
    result.quality.video.supported === true
  );
}

function validatePreCallStatuses() {
  const pass = getPreCallStatus({ success: true }, passingQuality());
  const loggingWarning = getPreCallStatus(
    {
      success: false,
      failedTests: [{ type: "logging" }]
    },
    passingQuality()
  );
  const reducedRecommendation = getPreCallStatus(
    { success: true },
    {
      ...passingQuality(),
      video: {
        ...passingQuality().video,
        recommendedResolution: "320x240",
        recommendedFrameRate: 7
      }
    }
  );
  const fail = getPreCallStatus(
    {
      success: false,
      failedTests: [{ type: "media" }]
    },
    null
  );

  return (
    pass.status === "Pass" &&
    loggingWarning.status === "Warn" &&
    reducedRecommendation.status === "Warn" &&
    fail.status === "Fail"
  );
}

function validateRecommendedSettings() {
  const videoOptions = getRecommendedPublisherOptions(passingQuality());
  const audioOnlyOptions = getRecommendedPublisherOptions({
    audio: { supported: true },
    video: {
      supported: false,
      reason: "Video is not supported."
    }
  });

  return (
    videoOptions.resolution === "640x480" &&
    videoOptions.frameRate === 15 &&
    audioOnlyOptions.videoSource === null &&
    !Object.hasOwn(audioOnlyOptions, "audioSource")
  );
}

function validatePreCallActivity(configured, activity) {
  const preCallSessionIds = activity.preCallSessionIds ?? [];
  const communicationSessionIds = new Set([
    ...(activity.publisherSessionIds ?? []),
    ...(activity.subscriberSessionIds ?? [])
  ]);

  return (
    configured &&
    preCallSessionIds.some((sessionId) => !communicationSessionIds.has(sessionId))
  );
}

function validateLiveTelemetry(activity) {
  const publisherSessionIds = new Set(activity.publisherSessionIds ?? []);
  return (activity.subscriberSessionIds ?? [])
    .some((sessionId) => publisherSessionIds.has(sessionId));
}

function passingQuality() {
  return {
    audio: {
      supported: true,
      bitrate: 32000,
      packetLossRatio: 0.01,
      mos: 4.1
    },
    video: {
      supported: true,
      bitrate: 420000,
      packetLossRatio: 0.01,
      mos: 3.9,
      recommendedResolution: "640x480",
      recommendedFrameRate: 15,
      qualityLimitationReason: null
    }
  };
}
