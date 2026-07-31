import {
  getPublisherOptions,
  observeQualityChanges,
  readSubscriberNetwork,
  startPublisherStats,
  startSubscriberStats
} from "/client-observability.js";
import {
  getPreCallStatus,
  getRecommendedPublisherOptions,
  runPreCallTest
} from "/pre-call.js";

const els = {
  exerciseChecks: document.querySelector("#exercise-checks"),
  completionToken: document.querySelector("#completion-token"),
  runPreCall: document.querySelector("#run-precall"),
  checkDevices: document.querySelector("#check-devices"),
  localPreview: document.querySelector("#local-preview"),
  cameraSelect: document.querySelector("#camera-select"),
  microphoneSelect: document.querySelector("#microphone-select"),
  preCallStatus: document.querySelector("#precall-status"),
  preCallReason: document.querySelector("#precall-reason"),
  connectivityResult: document.querySelector("#connectivity-result"),
  audioResult: document.querySelector("#audio-result"),
  videoResult: document.querySelector("#video-result"),
  recommendationResult: document.querySelector("#recommendation-result"),
  roomName: document.querySelector("#room-name"),
  joinCall: document.querySelector("#join-call"),
  leaveCall: document.querySelector("#leave-call"),
  callStatus: document.querySelector("#call-status"),
  publisher: document.querySelector("#publisher"),
  subscribers: document.querySelector("#subscribers"),
  publisherStats: document.querySelector("#publisher-stats"),
  subscriberStats: document.querySelector("#subscriber-stats"),
  qualityEvents: document.querySelector("#quality-events"),
  diagnosticActions: document.querySelector("#diagnostic-actions"),
  diagnosticResult: document.querySelector("#diagnostic-result")
};

let workspaceConfigured = false;
let preCallDecision;
let recommendedPublisherOptions = {};
let session;
let publisher;
let previewPublisher;
let activeSessionId;
let isJoining = false;
const cleanupCallbacks = [];
const reportedActivity = new Set();

const diagnosticExamples = {
  local: {
    label: "Local downlink issue",
    stats: {
      mediaLink: {
        networkDegradationSource: "local",
        transport: { networkCondition: "critical" },
        remotePublisherTransport: { networkCondition: "good" }
      }
    }
  },
  remote: {
    label: "Remote publisher issue",
    stats: {
      mediaLink: {
        networkDegradationSource: "remote",
        transport: { networkCondition: "good" },
        remotePublisherTransport: { networkCondition: "warning" }
      }
    }
  },
  bothOrUnclear: {
    label: "Both or unclear",
    stats: {
      mediaLink: {
        networkDegradationSource: "bothOrUnclear",
        transport: { networkCondition: "warning" },
        remotePublisherTransport: { networkCondition: "warning" }
      }
    }
  }
};

await initialize();

async function initialize() {
  els.checkDevices.addEventListener("click", () => startDevicePreview().catch(showPreCallError));
  els.cameraSelect.addEventListener("change", () => startDevicePreview().catch(showPreCallError));
  els.microphoneSelect.addEventListener("change", () => startDevicePreview().catch(showPreCallError));
  els.runPreCall.addEventListener("click", runNetworkTest);
  els.joinCall.addEventListener("click", () => joinCall().catch(showCallError));
  els.leaveCall.addEventListener("click", () => leaveCall("Disconnected."));
  renderDiagnosticExamples();
  await Promise.all([refreshWorkspaceStatus(), refreshExerciseStatus()]);
  window.setInterval(refreshWorkspaceStatus, 3000);
  window.setInterval(refreshExerciseStatus, 3000);
}

async function refreshWorkspaceStatus() {
  const status = await requestJson("/workspace/status");
  workspaceConfigured = status.configured;
  els.runPreCall.disabled = !workspaceConfigured;
  els.checkDevices.disabled = !workspaceConfigured;
  updateJoinButton();
}

async function startDevicePreview() {
  if (!workspaceConfigured || !window.OT) {
    return;
  }

  destroyDevicePreview();
  previewPublisher = await new Promise((resolve, reject) => {
    let activePublisher;
    activePublisher = OT.initPublisher(
      "local-preview",
      {
        insertMode: "append",
        width: "100%",
        height: "100%",
        publishAudio: false,
        audioSource: els.microphoneSelect.value || undefined,
        videoSource: els.cameraSelect.value || undefined
      },
      (error) => error ? reject(error) : resolve(activePublisher)
    );
  });
  await loadDevices();
}

async function loadDevices() {
  const devices = await new Promise((resolve, reject) => {
    OT.getDevices((error, values) => error ? reject(error) : resolve(values));
  });
  populateDeviceSelect(
    els.cameraSelect,
    devices.filter((device) => device.kind === "videoInput"),
    "Camera"
  );
  populateDeviceSelect(
    els.microphoneSelect,
    devices.filter((device) => device.kind === "audioInput"),
    "Microphone"
  );
}

function populateDeviceSelect(select, devices, fallbackLabel) {
  const selected = select.value;
  select.replaceChildren(
    ...devices.map((device, index) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent = device.label || `${fallbackLabel} ${index + 1}`;
      return option;
    })
  );
  if ([...select.options].some((option) => option.value === selected)) {
    select.value = selected;
  }
}

function destroyDevicePreview() {
  previewPublisher?.destroy();
  previewPublisher = null;
  els.localPreview.replaceChildren();
}

async function refreshExerciseStatus() {
  const status = await requestJson("/api/exercise/status");
  els.exerciseChecks.replaceChildren(
    ...status.checks.map((check) => {
      const item = document.createElement("li");
      item.className = check.complete ? "check-complete" : "";
      item.textContent = check.label;
      return item;
    })
  );

  els.completionToken.hidden = !status.complete;
  els.completionToken.textContent = status.credential
    ? `Learning Center validation URL: ${status.credential}`
    : "";
}

async function runNetworkTest() {
  const NetworkTest = window.OpenTokNetworkConnectivity?.default;
  if (!workspaceConfigured || !window.OT || !NetworkTest) {
    setPreCallDisplay("Fail", "The Video SDK or Network Test library is not available.");
    return;
  }

  els.runPreCall.disabled = true;
  destroyDevicePreview();
  setPreCallDisplay("Testing", "Checking connectivity...");
  els.connectivityResult.textContent = "In progress";
  els.audioResult.textContent = "Waiting";
  els.videoResult.textContent = "Waiting";
  els.recommendationResult.textContent = "Waiting";

  try {
    const sessionInfo = await requestJson("/api/pre-call/session");
    const result = await runPreCallTest({
      OT: window.OT,
      NetworkTest,
      sessionInfo,
      audioSource: els.microphoneSelect.value || undefined,
      videoSource: els.cameraSelect.value || undefined,
      onUpdate: renderQualityUpdate
    });

    const connectivityRan =
      result.connectivity?.success === true ||
      (result.connectivity?.failedTests?.length ?? 0) > 0;
    if (connectivityRan) {
      await reportActivity("pre-call-complete", sessionInfo.sessionId);
    }
    preCallDecision = getPreCallStatus(result.connectivity, result.quality);
    recommendedPublisherOptions = getRecommendedPublisherOptions(result.quality);
    renderPreCallResult(result, preCallDecision);
  } catch (error) {
    preCallDecision = {
      status: "Fail",
      reason: error.message || "The pre-call test could not finish."
    };
    recommendedPublisherOptions = {};
    setPreCallDisplay(preCallDecision.status, preCallDecision.reason);
    els.connectivityResult.textContent = error.name || "Failed";
    els.audioResult.textContent = "Not tested";
    els.videoResult.textContent = "Not tested";
    els.recommendationResult.textContent = "Not available";
  } finally {
    els.runPreCall.disabled = !workspaceConfigured;
    updateJoinButton();
    await refreshExerciseStatus();
  }
}

function showPreCallError(error) {
  setPreCallDisplay("Fail", error.message || "The device check could not finish.");
}

function renderQualityUpdate(stats) {
  const current = Array.isArray(stats) ? stats.at(-1) : stats;
  if (current?.audio) {
    els.audioResult.textContent = "Measuring";
  }
  if (current?.video) {
    els.videoResult.textContent = "Measuring";
  }
}

function renderPreCallResult(result, decision) {
  setPreCallDisplay(decision.status, decision.reason);
  const failedTypes = (result.connectivity?.failedTests ?? [])
    .map((test) => test.type)
    .join(", ");
  els.connectivityResult.textContent = failedTypes
    ? `Failed: ${failedTypes}`
    : result.connectivity?.success
      ? "Passed"
      : "Not available";

  els.audioResult.textContent = formatMediaResult(result.quality?.audio);
  els.videoResult.textContent = formatMediaResult(result.quality?.video);

  const resolution = result.quality?.video?.recommendedResolution;
  const frameRate = result.quality?.video?.recommendedFrameRate;
  els.recommendationResult.textContent = resolution && frameRate
    ? `${resolution} at ${frameRate} fps`
    : "Not available";
}

function setPreCallDisplay(status, reason) {
  const normalized = status.toLowerCase().replaceAll(" ", "-");
  els.preCallStatus.className = `status-${normalized}`;
  els.preCallStatus.textContent = status;
  els.preCallReason.textContent = reason;
}

function formatMediaResult(media) {
  if (!media) {
    return "Not tested";
  }
  if (!media.supported) {
    return media.reason || "Not supported";
  }
  const bitrate = Number.isFinite(media.bitrate)
    ? `${Math.round(media.bitrate / 1000)} kbps`
    : "supported";
  const packetLoss = Number.isFinite(media.packetLossRatio)
    ? `${Math.round(media.packetLossRatio * 100)}% loss`
    : null;
  return packetLoss ? `${bitrate}, ${packetLoss}` : bitrate;
}

async function joinCall() {
  if (isJoining || session || !["Pass", "Warn"].includes(preCallDecision?.status)) {
    return;
  }

  isJoining = true;
  destroyDevicePreview();
  updateJoinButton();
  setCallStatus("Creating the communication session...");

  try {
    const room = els.roomName.value.trim() || "observability-room";
    const credentials = await requestJson(`/api/session?room=${encodeURIComponent(room)}`);
    activeSessionId = credentials.sessionId;
    session = OT.initSession(credentials.applicationId, credentials.sessionId);

    session.on("streamCreated", (event) => {
      const container = document.createElement("div");
      container.className = "subscriber-tile";
      els.subscribers.append(container);

      const subscriber = session.subscribe(event.stream, container, {
        insertMode: "append",
        width: "100%",
        height: "100%"
      });
      cleanupCallbacks.push(
        startSubscriberStats(subscriber, renderSubscriberStats),
        observeQualityChanges(subscriber, "subscriber", renderQualityChange)
      );
    });

    await connectSession(session, credentials.token);
    publisher = OT.initPublisher(
      "publisher",
      {
        ...getPublisherOptions(),
        audioSource: els.microphoneSelect.value || undefined,
        videoSource: els.cameraSelect.value || undefined,
        ...recommendedPublisherOptions
      }
    );
    cleanupCallbacks.push(
      startPublisherStats(publisher, renderPublisherStats),
      observeQualityChanges(publisher, "publisher", renderQualityChange)
    );
    await publishToSession(session, publisher);

    els.leaveCall.disabled = false;
    setCallStatus(`Connected to ${room}. Open this app in another window and join the same room to add a subscriber.`);
  } catch (error) {
    leaveCall(error.message);
    throw error;
  } finally {
    isJoining = false;
    updateJoinButton();
  }
}

function connectSession(activeSession, token) {
  return new Promise((resolve, reject) => {
    activeSession.connect(token, (error) => error ? reject(error) : resolve());
  });
}

function publishToSession(activeSession, activePublisher) {
  return new Promise((resolve, reject) => {
    activeSession.publish(
      activePublisher,
      (error) => error ? reject(error) : resolve()
    );
  });
}

function leaveCall(message) {
  while (cleanupCallbacks.length) {
    cleanupCallbacks.pop()?.();
  }
  session?.disconnect();
  session = null;
  publisher = null;
  activeSessionId = null;
  els.publisher.replaceChildren();
  els.subscribers.replaceChildren();
  els.leaveCall.disabled = true;
  setCallStatus(message);
  updateJoinButton();
}

function updateJoinButton() {
  const canJoin = workspaceConfigured &&
    ["Pass", "Warn"].includes(preCallDecision?.status) &&
    !session &&
    !isJoining;
  els.joinCall.disabled = !canJoin;
}

function renderPublisherStats(sample) {
  const stats = sample?.stats ?? {};
  if (sample?.stats && activeSessionId) {
    void reportActivity("publisher-stats", activeSessionId)
      .catch(showCallError);
  }
  const videoLayer = stats.video?.layers?.[0] ?? {};
  const transport = stats.mediaLink?.transport ?? {};
  renderMetricList(els.publisherStats, [
    ["Network condition", transport.networkCondition ?? "Unknown"],
    ["Condition reason", transport.networkConditionReason ?? "None"],
    ["Estimated bandwidth", formatBitrate(transport.connectionEstimatedBandwidth)],
    ["Video bitrate", formatBitrate(videoLayer.bitrate ?? stats.video?.bitrate)],
    ["Frame rate", formatNumber(videoLayer.encodedFrameRate ?? videoLayer.frameRate, " fps")]
  ]);
}

function renderSubscriberStats(sample) {
  const stats = sample?.stats ?? {};
  if (sample?.stats && activeSessionId) {
    void reportActivity("subscriber-stats", activeSessionId)
      .catch(showCallError);
  }
  const network = readSubscriberNetwork(stats);
  renderMetricList(els.subscriberStats, [
    ["Degradation source", network.source],
    ["Local condition", network.localCondition],
    ["Remote condition", network.remoteCondition],
    ["Video bitrate", formatBitrate(stats.video?.bitrate)],
    ["Decoded frame rate", formatNumber(stats.video?.decodedFrameRate, " fps")],
    ["Freeze count", stats.video?.freezeCount ?? "Not available"],
    ["Sender bandwidth", formatBitrate(stats.senderStats?.connectionEstimatedBandwidth)]
  ]);
}

function renderQualityChange(event) {
  const item = document.createElement("li");
  let detail = event.reason || "Condition changed";

  if (event.source === "subscriber" && event.type === "networkConditionChanged") {
    const network = readSubscriberNetwork(event.stats);
    detail = `${network.source}: local ${network.localCondition}, remote ${network.remoteCondition}`;
  }

  item.textContent = `${event.source} ${event.type}: ${detail}`;
  els.qualityEvents.prepend(item);
  while (els.qualityEvents.children.length > 8) {
    els.qualityEvents.lastElementChild.remove();
  }
}

function renderMetricList(container, metrics) {
  container.replaceChildren(
    ...metrics.map(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = String(value);
      row.append(term, description);
      return row;
    })
  );
}

function renderDiagnosticExamples() {
  els.diagnosticActions.replaceChildren(
    ...Object.values(diagnosticExamples).map((example) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-secondary";
      button.textContent = example.label;
      button.addEventListener("click", () => {
        const result = readSubscriberNetwork(example.stats);
        els.diagnosticResult.textContent =
          `Source: ${result.source}. Local condition: ${result.localCondition}. Remote condition: ${result.remoteCondition}.`;
      });
      return button;
    })
  );
}

function formatBitrate(value) {
  return Number.isFinite(value) ? `${Math.round(value / 1000)} kbps` : "Not available";
}

function formatNumber(value, suffix) {
  return Number.isFinite(value) ? `${Math.round(value)}${suffix}` : "Not available";
}

function setCallStatus(message) {
  els.callStatus.textContent = message;
}

function showCallError(error) {
  setCallStatus(error.message || "The call could not start.");
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || body.error || "The request failed.");
  }
  return body;
}

async function reportActivity(type, sessionId) {
  const key = `${type}:${sessionId}`;
  if (!sessionId || reportedActivity.has(key)) {
    return;
  }

  const response = await fetch("/api/exercise/activity", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ type, sessionId })
  });

  if (!response.ok) {
    throw new Error("The exercise activity could not be recorded.");
  }

  reportedActivity.add(key);
}
