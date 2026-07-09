import {
  getPublisherOptions,
  getPublisherProfiles,
  getRecordingLayoutPreview,
  recordPublisherProfile,
  registerDebugLogging,
  setupArchivingControls,
  setupSignalingChat,
  setupSubscriberQuality
} from "/app/exercise-hooks.js";

const els = {
  roomName: document.querySelector("#roomName"),
  joinBtn: document.querySelector("#joinBtn"),
  leaveBtn: document.querySelector("#leaveBtn"),
  callStatus: document.querySelector("#callStatus"),
  publisher: document.querySelector("#publisher"),
  subscribers: document.querySelector("#subscribers"),
  muteAudioBtn: document.querySelector("#muteAudioBtn"),
  chatMessages: document.querySelector("#chatMessages"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  publisherProfile: document.querySelector("#publisherProfile"),
  applyPublisherProfile: document.querySelector("#applyPublisherProfile"),
  publisherStatus: document.querySelector("#publisherStatus"),
  subscriberStatus: document.querySelector("#subscriberStatus"),
  simulateDegraded: document.querySelector("#simulateDegraded"),
  simulateRecovered: document.querySelector("#simulateRecovered"),
  focusTarget: document.querySelector("#focusTarget"),
  previewRecordingLayout: document.querySelector("#previewRecordingLayout"),
  recordingStatus: document.querySelector("#recordingStatus"),
  startArchive: document.querySelector("#startArchive"),
  stopArchive: document.querySelector("#stopArchive"),
  archiveStatus: document.querySelector("#archiveStatus"),
  archiveLink: document.querySelector("#archiveLink")
};

let session;
let publisher;
let currentSessionId;
let latestArchiveId;
let isJoining = false;
let isAudioMuted = false;
const remoteStreams = new Map();

function setStatus(message) {
  els.callStatus.textContent = message;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

function populatePublisherProfiles() {
  const profiles = getPublisherProfiles();
  els.publisherProfile.innerHTML = "";
  for (const name of Object.keys(profiles)) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    els.publisherProfile.append(option);
  }
  if (!els.publisherProfile.options.length) {
    const option = document.createElement("option");
    option.value = "Balanced";
    option.textContent = "Balanced";
    els.publisherProfile.append(option);
  }
}

function updateMuteAudioButton() {
  els.muteAudioBtn.disabled = !publisher;
  els.muteAudioBtn.textContent = isAudioMuted ? "Unmute audio" : "Mute audio";
}

async function joinCall() {
  if (isJoining || session) {
    return;
  }

  if (!window.OT) {
    setStatus("Vonage Video Client Library did not load.");
    return;
  }

  isJoining = true;
  els.joinBtn.disabled = true;
  setStatus("Creating session...");
  try {
    const room = els.roomName.value || "advanced-room";
    const credentials = await fetch(`/api/session?room=${encodeURIComponent(room)}`).then((res) => res.json());
    if (credentials.error) {
      setStatus(`${credentials.error}: ${credentials.message}`);
      return;
    }

    currentSessionId = credentials.sessionId;
    session = OT.initSession(credentials.applicationId, credentials.sessionId);

    session.on("streamCreated", (event) => {
      const streamId = event.stream?.streamId;
      if (streamId) {
        remoteStreams.set(streamId, event.stream);
      }

      const container = document.createElement("div");
      container.className = "video-stage subscriber-tile rounded overflow-hidden border bg-black";
      els.subscribers.append(container);
      const subscriber = session.subscribe(event.stream, container, {
        insertMode: "append",
        width: "100%",
        height: "100%"
      });
      setupSubscriberQuality({ session, subscriber, elements: els, postJson });
      updateFocusTargets();
    });

    session.on("streamDestroyed", (event) => {
      const streamId = event.stream?.streamId;
      if (streamId) {
        remoteStreams.delete(streamId);
      }
      updateFocusTargets();
    });
    registerDebugLogging({ session, elements: els, postJson, getSessionId: () => currentSessionId });
    setupSignalingChat({ session, elements: els, postJson });
    setupArchivingControls({
      session,
      elements: els,
      postJson,
      getSessionId: () => currentSessionId,
      getLatestArchiveId: () => latestArchiveId,
      setLatestArchiveId: (id) => { latestArchiveId = id; }
    });

    await new Promise((resolve, reject) => {
      session.connect(credentials.token, (error) => error ? reject(error) : resolve());
    });

    const selectedProfile = els.publisherProfile.value || "Balanced";
    publisher = OT.initPublisher("publisher", getPublisherOptions(selectedProfile));
    publisher.publishAudio(!isAudioMuted);
    await new Promise((resolve, reject) => {
      session.publish(publisher, (error) => error ? reject(error) : resolve());
    });

    els.leaveBtn.disabled = false;
    updateMuteAudioButton();
    setStatus(`Connected to ${room}.`);
    updateFocusTargets();
  } catch (error) {
    leaveCall();
    throw error;
  } finally {
    isJoining = false;
    els.joinBtn.disabled = Boolean(session);
  }
}

function leaveCall(statusMessage) {
  if (session) {
    session.disconnect();
  }
  session = null;
  publisher = null;
  currentSessionId = null;
  isAudioMuted = false;
  remoteStreams.clear();
  els.publisher.innerHTML = "";
  els.subscribers.innerHTML = "";
  els.joinBtn.disabled = false;
  els.leaveBtn.disabled = true;
  updateMuteAudioButton();
  if (statusMessage) {
    setStatus(statusMessage);
  }
  updateFocusTargets();
}

function updateFocusTargets() {
  els.focusTarget.innerHTML = "";
  const localOption = document.createElement("option");
  localOption.value = "publisher";
  localOption.textContent = "Local publisher";
  els.focusTarget.append(localOption);

  for (const stream of remoteStreams.values()) {
    const streamId = stream?.streamId;
    if (!streamId) {
      continue;
    }

    const option = document.createElement("option");
    option.value = streamId;
    option.textContent = `Subscriber ${streamId.slice(-6)}`;
    els.focusTarget.append(option);
  }
}

els.joinBtn.addEventListener("click", () => joinCall().catch((error) => setStatus(error.message)));
els.leaveBtn.addEventListener("click", () => leaveCall("Disconnected."));
els.muteAudioBtn.addEventListener("click", () => {
  if (!publisher) {
    return;
  }

  isAudioMuted = !isAudioMuted;
  publisher.publishAudio(!isAudioMuted);
  updateMuteAudioButton();
});

els.applyPublisherProfile.addEventListener("click", async () => {
  if (!session || !publisher) {
    els.publisherStatus.textContent = "Join the call first.";
    return;
  }
  const profile = els.publisherProfile.value || "Balanced";
  session.unpublish(publisher);
  els.publisher.innerHTML = "";
  publisher = OT.initPublisher("publisher", getPublisherOptions(profile));
  publisher.publishAudio(!isAudioMuted);
  session.publish(publisher, async (error) => {
    if (error) {
      els.publisherStatus.textContent = error.message;
      return;
    }
    await recordPublisherProfile(profile, postJson);
    els.publisherStatus.textContent = `Applied ${profile}.`;
  });
});

els.previewRecordingLayout.addEventListener("click", async () => {
  const preview = getRecordingLayoutPreview({ focusTarget: els.focusTarget.value });
  await postJson("/api/recordings/preview", preview);
  els.recordingStatus.textContent = preview.focused ? `Preview ready with ${preview.streamClass}.` : "Layout preview is not implemented yet.";
});

populatePublisherProfiles();
