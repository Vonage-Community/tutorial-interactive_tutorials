export function getPublisherOptions() {
  // TODO: Enable sender-side statistics
  return {
    insertMode: "append",
    width: "100%",
    height: "100%"
  };
}

export function startPublisherStats(publisher, onSample) {
  // TODO: Collect Publisher statistics
  return () => {};
}

export function startSubscriberStats(subscriber, onSample) {
  // TODO: Collect Subscriber statistics
  return () => {};
}

export function observeQualityChanges(target, source, onChange) {
  // TODO: Observe quality and network condition changes
  return () => {};
}

export function readSubscriberNetwork(stats) {
  // TODO: Read the Subscriber degradation source
  return {
    source: "unknown",
    localCondition: "unknown",
    remoteCondition: "unknown"
  };
}
