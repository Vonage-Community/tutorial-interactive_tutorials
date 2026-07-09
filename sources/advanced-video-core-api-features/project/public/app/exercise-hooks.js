export function registerDebugLogging({ session, postJson, getSessionId }) {
  // TODO function registerDebugLogging: replace this function with the code from the guide.
}

function bindOnce(element, flag, handler) {
  if (!element || element.dataset[flag] === "true") {
    return;
  }

  element.dataset[flag] = "true";
  element.addEventListener(handler.type, handler.listener);
}

export function setupSignalingChat({ session, elements, postJson }) {
  // TODO function setupSignalingChat: replace this function with the code from the guide.
  bindOnce(elements.chatForm, "placeholderSubmit", {
    type: "submit",
    listener: (event) => {
      event.preventDefault();
      elements.chatMessages.textContent = "Signaling chat is not implemented yet.";
    }
  });
}

export function getPublisherProfiles() {
  // TODO function getPublisherProfiles: replace this function with the code from the guide.
  return {};
}

export function getPublisherOptions(profileName) {
  // TODO function getPublisherOptions: replace this function with the code from the guide.
  return { insertMode: "append", width: "100%", height: "100%" };
}

export async function recordPublisherProfile(profileName, postJson) {
  // TODO function recordPublisherProfile: replace this function with the code from the guide.
}

export function setupSubscriberQuality({ session, elements, postJson }) {
  // TODO function setupSubscriberQuality: replace this function with the code from the guide.
  const showPlaceholder = () => {
    elements.subscriberStatus.textContent = "Subscriber quality controls are not implemented yet.";
  };

  bindOnce(elements.simulateDegraded, "placeholderClick", {
    type: "click",
    listener: showPlaceholder
  });
  bindOnce(elements.simulateRecovered, "placeholderClick", {
    type: "click",
    listener: showPlaceholder
  });
}

export function getRecordingLayoutPreview({ focusTarget }) {
  // TODO function getRecordingLayoutPreview: replace this function with the code from the guide.
  return { layout: null, streamClass: null, focused: false };
}

export function setupArchivingControls({ elements, postJson, getSessionId, getLatestArchiveId, setLatestArchiveId }) {
  // TODO function setupArchivingControls: replace this function with the code from the guide.
  const showPlaceholder = () => {
    elements.archiveStatus.textContent = "Archiving controls are not implemented yet.";
  };

  bindOnce(elements.startArchive, "placeholderClick", {
    type: "click",
    listener: showPlaceholder
  });
  bindOnce(elements.stopArchive, "placeholderClick", {
    type: "click",
    listener: showPlaceholder
  });
}
