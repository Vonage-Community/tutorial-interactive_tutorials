const root = document.querySelector("#subscriber-root");
const params = new URLSearchParams(window.location.search);
const applicationId = params.get("applicationId");
const sessionId = params.get("sessionId");
const token = params.get("token");

let session;
let subscriber;
const cleanupCallbacks = [];

initialize().catch(reportError);

async function initialize() {
  if (!applicationId || !sessionId || !token) {
    throw new Error("Subscriber credentials are missing.");
  }

  session = OT.initSession(applicationId, sessionId);
  session.on("streamCreated", subscribeToStream);
  await connectSession(session, token);
}

function subscribeToStream(event) {
  if (subscriber) {
    return;
  }

  root.replaceChildren();
  subscriber = session.subscribe(
    event.stream,
    root,
    {
      insertMode: "append",
      width: "100%",
      height: "100%",
      subscribeToAudio: false
    },
    (error) => {
      if (error) {
        reportError(error);
        return;
      }

      startSubscriberTelemetry(event.stream);
      postToParent("subscriber-ready");
    }
  );
}

function connectSession(activeSession, activeToken) {
  return new Promise((resolve, reject) => {
    activeSession.connect(
      activeToken,
      (error) => error ? reject(error) : resolve()
    );
  });
}

function startSubscriberTelemetry(stream) {
  const collect = () => {
    subscriber?.getStats((error, stats) => {
      if (error) {
        console.warn(`Subscriber statistics error: ${error.message}`);
        return;
      }

      const transport = stats.mediaLink?.transport ?? {};
      sendTelemetry({
        participantId: "subscriber-demo",
        source: "subscriber",
        connectionId:
          session.connection?.connectionId || "subscriber-connection",
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
  try {
    await requestJson("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        sessionId,
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
    console.warn(`Telemetry was not accepted: ${error.message}`);
  }
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

function postToParent(type, payload = {}) {
  window.parent?.postMessage({ type, ...payload }, window.location.origin);
}

function reportError(error) {
  const message = error.message || "Subscriber failed to connect.";
  root.textContent = message;
  postToParent("subscriber-error", { message });
}

window.addEventListener("message", (event) => {
  if (
    event.origin !== window.location.origin ||
    event.data?.type !== "stop-subscriber"
  ) {
    return;
  }

  while (cleanupCallbacks.length) {
    cleanupCallbacks.pop()?.();
  }
  session?.disconnect();
});
