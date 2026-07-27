const els = {
  setupNotice: document.querySelector("#setup-notice"),
  checkSetup: document.querySelector("#check-setup"),
  exerciseChecks: document.querySelector("#exercise-checks"),
  completionCredential: document.querySelector("#completion-credential"),
  startSession: document.querySelector("#start-session"),
  stopSession: document.querySelector("#stop-session"),
  sessionStatus: document.querySelector("#session-status"),
  publisherVideo: document.querySelector("#publisher-video"),
  subscriberVideo: document.querySelector("#subscriber-video"),
  applicationId: document.querySelector("#application-id"),
  sessionId: document.querySelector("#session-id"),
  recordCount: document.querySelector("#record-count"),
  callbackCount: document.querySelector("#callback-count"),
  summaryMetrics: document.querySelector("#summary-metrics"),
  recordsTable: document.querySelector("#records-table"),
  createSupportCase: document.querySelector("#create-support-case"),
  alerts: document.querySelector("#alerts"),
  supportCase: document.querySelector("#support-case")
};

let configured = false;
let activeCredentials;
let publisherSession;
let subscriberSession;
let publisher;
let subscriber;
let syntheticVideo;
let starting = false;
const cleanupCallbacks = [];

await initialize();

async function initialize() {
  els.checkSetup.addEventListener("click", refreshWorkspaceStatus);
  els.startSession.addEventListener("click", () =>
    startLiveSession().catch(showSessionError)
  );
  els.stopSession.addEventListener("click", () =>
    stopLiveSession("The session has ended. Its telemetry remains available.")
  );
  els.createSupportCase.addEventListener("click", () =>
    createSupportCase().catch(showSessionError)
  );

  await Promise.all([
    refreshWorkspaceStatus(),
    refreshDashboard(),
    refreshExerciseStatus()
  ]);
  window.setInterval(refreshDashboard, 2000);
  window.setInterval(refreshExerciseStatus, 3000);
}

async function refreshWorkspaceStatus() {
  const status = await requestJson("/workspace/status");
  configured = status.configured;
  els.setupNotice.hidden = configured;
  els.applicationId.textContent = status.configured
    ? "Configured for this Codespace"
    : "Not configured";
  updateControls();

  if (configured && !activeCredentials) {
    setSessionStatus("Account connected. Start a routed session when you are ready.");
  }
}

async function startLiveSession() {
  if (!configured || starting) {
    return;
  }

  starting = true;
  updateControls();
  stopLiveSession("Creating a new routed session...");
  setSessionStatus("Creating a new routed session...");

  try {
    activeCredentials = await requestJson("/api/session", { method: "POST" });
    els.applicationId.textContent = activeCredentials.applicationId;
    els.sessionId.textContent = activeCredentials.sessionId;

    syntheticVideo = createSyntheticVideo();
    subscriberSession = OT.initSession(
      activeCredentials.applicationId,
      activeCredentials.sessionId
    );
    publisherSession = OT.initSession(
      activeCredentials.applicationId,
      activeCredentials.sessionId
    );

    const subscriberReady = waitForSubscriber();
    await connectSession(
      subscriberSession,
      activeCredentials.subscriberToken
    );
    await connectSession(
      publisherSession,
      activeCredentials.publisherToken
    );

    publisher = await initializePublisher(syntheticVideo.track);
    await publishToSession(publisherSession, publisher);
    startPublisherTelemetry();
    await withTimeout(subscriberReady, 15000);

    setSessionStatus(
      "Publisher and subscriber are connected. Live telemetry is being sent to the backend."
    );
  } catch (error) {
    stopLiveSession(error.message);
    throw error;
  } finally {
    starting = false;
    updateControls();
    await Promise.all([refreshDashboard(), refreshExerciseStatus()]);
  }
}

function waitForSubscriber() {
  return new Promise((resolve, reject) => {
    subscriberSession.on("streamCreated", (event) => {
      els.subscriberVideo.replaceChildren();
      subscriber = subscriberSession.subscribe(
        event.stream,
        els.subscriberVideo,
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
          subscribeToAudio: false
        },
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          startSubscriberTelemetry(event.stream);
          resolve();
        }
      );
    });
  });
}

function initializePublisher(videoTrack) {
  els.publisherVideo.replaceChildren();
  return new Promise((resolve, reject) => {
    let initializedPublisher;
    initializedPublisher = OT.initPublisher(
      els.publisherVideo,
      {
        insertMode: "append",
        width: "100%",
        height: "100%",
        publishAudio: false,
        videoSource: videoTrack,
        publishSenderStats: true,
        name: "Observability publisher"
      },
      (error) => error ? reject(error) : resolve(initializedPublisher)
    );
  });
}

function connectSession(session, token) {
  return new Promise((resolve, reject) => {
    session.connect(token, (error) => error ? reject(error) : resolve());
  });
}

function publishToSession(session, activePublisher) {
  return new Promise((resolve, reject) => {
    session.publish(
      activePublisher,
      (error) => error ? reject(error) : resolve()
    );
  });
}

function startPublisherTelemetry() {
  const collect = () => {
    publisher?.getStats((error, statsArray) => {
      if (error) {
        setSessionStatus(`Publisher statistics error: ${error.message}`, true);
        return;
      }

      for (const statsContainer of statsArray) {
        const stats = statsContainer.stats ?? {};
        const layer = stats.video?.layers?.[0] ?? {};
        const transport = stats.mediaLink?.transport ?? {};
        sendTelemetry({
          participantId: "publisher-demo",
          source: "publisher",
          connectionId:
            publisherSession.connection?.connectionId || "publisher-connection",
          streamId: publisher.stream?.streamId || "publisher-stream",
          metrics: {
            networkCondition: transport.networkCondition ?? "unknown",
            networkConditionReason:
              transport.networkConditionReason ?? "unknown",
            networkDegradationSource: "none",
            connectionEstimatedBandwidth:
              numberOrNull(transport.connectionEstimatedBandwidth),
            videoBitrate: numberOrNull(layer.bitrate),
            videoWidth: numberOrNull(layer.width),
            videoHeight: numberOrNull(layer.height),
            encodedFrameRate: numberOrNull(layer.encodedFrameRate),
            decodedFrameRate: null,
            freezeCount: null,
            totalFreezesDuration: null,
            pauseCount: null,
            totalPausesDuration: null,
            senderEstimatedBandwidth: null,
            scalabilityMode: layer.scalabilityMode ?? null,
            qualityLimitationReason:
              layer.qualityLimitationReason ?? "none"
          }
        });
      }
    });
  };

  collect();
  const intervalId = window.setInterval(collect, 2500);
  cleanupCallbacks.push(() => window.clearInterval(intervalId));
}

function startSubscriberTelemetry(stream) {
  const collect = () => {
    subscriber?.getStats((error, stats) => {
      if (error) {
        setSessionStatus(`Subscriber statistics error: ${error.message}`, true);
        return;
      }

      const transport = stats.mediaLink?.transport ?? {};
      sendTelemetry({
        participantId: "subscriber-demo",
        source: "subscriber",
        connectionId:
          subscriberSession.connection?.connectionId || "subscriber-connection",
        streamId: stream.streamId,
        metrics: {
          networkCondition: transport.networkCondition ?? "unknown",
          networkConditionReason:
            transport.networkConditionReason ?? "unknown",
          networkDegradationSource:
            stats.mediaLink?.networkDegradationSource ?? "none",
          connectionEstimatedBandwidth:
            numberOrNull(transport.connectionEstimatedBandwidth),
          videoBitrate: numberOrNull(stats.video?.bitrate),
          videoWidth: numberOrNull(stats.video?.width),
          videoHeight: numberOrNull(stats.video?.height),
          encodedFrameRate: null,
          decodedFrameRate: numberOrNull(stats.video?.decodedFrameRate),
          freezeCount: numberOrNull(stats.video?.freezeCount),
          totalFreezesDuration:
            numberOrNull(stats.video?.totalFreezesDuration),
          pauseCount: numberOrNull(stats.video?.pauseCount),
          totalPausesDuration:
            numberOrNull(stats.video?.totalPausesDuration),
          senderEstimatedBandwidth:
            numberOrNull(stats.senderStats?.connectionEstimatedBandwidth),
          scalabilityMode: null,
          qualityLimitationReason: null
        }
      });
    });
  };

  collect();
  const intervalId = window.setInterval(collect, 2500);
  cleanupCallbacks.push(() => window.clearInterval(intervalId));
}

async function sendTelemetry({ participantId, source, connectionId, streamId, metrics }) {
  if (!activeCredentials) {
    return;
  }

  try {
    await requestJson("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        sessionId: activeCredentials.sessionId,
        connectionId,
        streamId,
        participantId,
        source,
        mediaMode: "routed",
        sdk: {
          platform: "web",
          version: OT.properties?.version ?? "2.x"
        },
        capturedAt: new Date().toISOString(),
        metrics
      })
    });
  } catch (error) {
    setSessionStatus(`Telemetry was not accepted: ${error.message}`, true);
  }
}

function stopLiveSession(message) {
  while (cleanupCallbacks.length) {
    cleanupCallbacks.pop()?.();
  }

  publisherSession?.disconnect();
  subscriberSession?.disconnect();
  syntheticVideo?.stop();
  publisherSession = null;
  subscriberSession = null;
  publisher = null;
  subscriber = null;
  syntheticVideo = null;
  els.publisherVideo.innerHTML = "<span>Not connected</span>";
  els.subscriberVideo.innerHTML = "<span>Not connected</span>";
  setSessionStatus(message);
  updateControls();
}

async function createSupportCase() {
  const result = await requestJson("/api/support-case", { method: "POST" });
  renderSupportCase(result);
}

async function refreshDashboard() {
  const dashboard = await requestJson("/api/dashboard");
  if (dashboard.applicationId) {
    els.applicationId.textContent = dashboard.applicationId;
  }
  if (dashboard.sessionId) {
    els.sessionId.textContent = dashboard.sessionId;
  }
  els.recordCount.textContent = dashboard.recordCount;
  els.callbackCount.textContent = dashboard.callbackCount;
  els.createSupportCase.disabled =
    dashboard.recordCount === 0 || starting;

  renderSummary(dashboard.sessions[0]);
  renderRecords(dashboard.recentRecords);
  renderAlerts(dashboard.alerts);
  renderSupportCase(dashboard.supportCase);
}

async function refreshExerciseStatus() {
  const status = await requestJson("/api/exercise/status");
  els.exerciseChecks.replaceChildren(
    ...status.checks.map((check) => {
      const item = document.createElement("li");
      item.className = check.complete ? "check-complete" : "";
      item.innerHTML = `
        <span aria-hidden="true">${check.complete ? "✓" : "○"}</span>
        ${escapeHtml(check.label)}
      `;
      return item;
    })
  );

  els.completionCredential.hidden = !status.complete;
  els.completionCredential.textContent = status.credential
    ? `Learning Center validation URL: ${status.credential}`
    : "";
}

function renderSummary(summary) {
  const values = summary
    ? [
        ["Publisher records", summary.publisherSamples],
        ["Subscriber records", summary.subscriberSamples],
        ["Unhealthy records", summary.warningSamples],
        ["Affected streams", summary.affectedStreams],
        ["Latest condition", summary.latestCondition]
      ]
    : [
        ["Publisher records", 0],
        ["Subscriber records", 0],
        ["Unhealthy records", 0],
        ["Affected streams", 0],
        ["Latest condition", "Not available"]
      ];

  els.summaryMetrics.replaceChildren(
    ...values.map(([label, value]) => createMetric(label, value))
  );
}

function renderRecords(records) {
  els.recordsTable.innerHTML = records.length
    ? records.map((record) => `
        <tr>
          <td>${escapeHtml(formatTime(record.capturedAt))}</td>
          <td>${escapeHtml(record.source)}</td>
          <td>${escapeHtml(record.metrics?.networkCondition ?? "unknown")}</td>
          <td>${escapeHtml(record.metrics?.networkConditionReason ?? "unknown")}</td>
          <td>${escapeHtml(formatBitrate(record.metrics?.videoBitrate))}</td>
        </tr>
      `).join("")
    : '<tr><td colspan="5">Start a session to collect telemetry.</td></tr>';
}

function renderAlerts(alerts) {
  if (!alerts.length) {
    els.alerts.className = "empty-state";
    els.alerts.textContent =
      "No sustained issue has been detected in this session.";
    return;
  }

  els.alerts.className = "evidence";
  els.alerts.innerHTML = alerts.map((alert) => `
    <p><strong>${escapeHtml(alert.condition)}</strong> for
      ${escapeHtml(String(alert.sampleCount))} consecutive records</p>
    <p>${escapeHtml(alert.reason)} · ${escapeHtml(alert.degradationSource)}</p>
  `).join("");
}

function renderSupportCase(value) {
  if (!value) {
    els.supportCase.className = "empty-state";
    els.supportCase.textContent =
      "Collect subscriber telemetry before creating a report.";
    return;
  }

  const { report, evidence } = value;
  els.supportCase.className = "evidence";
  els.supportCase.innerHTML = `
    <p><strong>${escapeHtml(report.caseId)}</strong></p>
    <dl>
      <div><dt>Telemetry records</dt><dd>${evidence.telemetry.length}</dd></div>
      <div><dt>Connection IDs</dt><dd>${evidence.identifiers.connectionIds.length}</dd></div>
      <div><dt>Stream IDs</dt><dd>${evidence.identifiers.streamIds.length}</dd></div>
    </dl>
    <p>Search for this Session ID in Inspector:</p>
    <code>${escapeHtml(report.sessionId)}</code>
  `;
}

function createSyntheticVideo() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const context = canvas.getContext("2d");
  let frame = 0;
  let animationId;

  const draw = () => {
    const hue = (frame * 2) % 360;
    context.fillStyle = `hsl(${hue} 55% 24%)`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.font = "600 32px system-ui";
    context.fillText("Vonage Video API", 32, 64);
    context.font = "24px system-ui";
    context.fillText(new Date().toLocaleTimeString(), 32, 108);
    context.fillStyle = "#72efc5";
    context.fillRect(32, 150, 80 + (frame % 440), 16);
    frame += 1;
    animationId = requestAnimationFrame(draw);
  };
  draw();

  const stream = canvas.captureStream(15);
  const track = stream.getVideoTracks()[0];
  return {
    track,
    stop() {
      cancelAnimationFrame(animationId);
      track.stop();
    }
  };
}

function createMetric(label, value) {
  const element = document.createElement("div");
  element.className = "metric";
  element.innerHTML = `
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(String(value))}</strong>
  `;
  return element;
}

function updateControls() {
  const connected = Boolean(publisherSession && subscriberSession);
  els.startSession.disabled = !configured || starting || connected;
  els.stopSession.disabled = !connected;
}

function setSessionStatus(message, isError = false) {
  els.sessionStatus.textContent = message;
  els.sessionStatus.classList.toggle("notice-error", isError);
}

function showSessionError(error) {
  setSessionStatus(error.message || "The operation failed.", true);
}

function withTimeout(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(
        () => reject(new Error("The subscriber did not receive the stream.")),
        milliseconds
      );
    })
  ]);
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || body.error || "The request failed.");
  }
  return body;
}

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function formatTime(value) {
  return value
    ? new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(value))
    : "Unknown";
}

function formatBitrate(value) {
  return Number.isFinite(value) ? `${Math.round(value / 1000)} kbps` : "-";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
