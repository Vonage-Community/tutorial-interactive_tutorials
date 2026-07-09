export function registerDebugLogging() {
  // TODO(debug-timeline): replace this function with the code from the guide.
}

function bindOnce(element, flag, handler) {
  if (!element || element.dataset[flag] === "true") {
    return;
  }

  element.dataset[flag] = "true";
  element.addEventListener(handler.type, handler.listener);
}

export function setupSignalingChat({ elements }) {
  // TODO(signaling-chat): replace this function with the code from the guide.
  bindOnce(elements.chatForm, "placeholderSubmit", {
    type: "submit",
    listener: (event) => {
      event.preventDefault();
      elements.chatMessages.textContent = "Signaling chat is not implemented yet.";
    }
  });
}

export function getPublisherProfiles() {
  // TODO(publisher-tuning): replace this function with the code from the guide.
  return {};
}

export function getPublisherOptions(_profileName) {
  // TODO(publisher-tuning): replace this function with the code from the guide.
  return { insertMode: "append", width: "100%", height: "100%" };
}

export async function recordPublisherProfile() {
  // TODO(publisher-tuning): replace this function with the code from the guide.
}

export function setupSubscriberQuality({ elements }) {
  // TODO(subscriber-quality): replace this function with the code from the guide.
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

export function getRecordingLayoutPreview() {
  // TODO(recording-layout): replace this function with the code from the guide.
  return { layout: null, streamClass: null, focused: false };
}

export function setupArchivingControls({ elements }) {
  // TODO(archiving): replace this function with the code from the guide.
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
