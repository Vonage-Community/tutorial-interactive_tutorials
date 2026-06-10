import { pushLimited, state, findRoomForSession } from "./advanced-video-state.js";

export function recordClientDebugEvent(_event) {
  // TODO(debug-timeline): replace this function with the code from the guide.
}

export function recordVideoCallback(_payload) {
  // TODO(debug-timeline): replace this function with the code from the guide.
}

export function recordSignalActivity(message) {
  pushLimited(state.activityMessages, {
    type: message.type,
    data: message.data,
    roomWide: message.roomWide === true,
    from: message.from || "participant"
  });
}

export function recordPublisherDiagnostics(diagnostics) {
  state.publisherDiagnostics = {
    profile: diagnostics.profile || "Unknown",
    applied: diagnostics.applied === true,
    settings: diagnostics.settings || {},
    updatedAt: new Date().toISOString()
  };
}

export function recordSubscriberState(entry) {
  pushLimited(state.subscriberDiagnostics.history, {
    state: entry.state,
    recovered: entry.recovered === true,
    reason: entry.reason || null
  });
}

export function recordLayoutPreview(preview) {
  state.recording = {
    layout: preview.layout || null,
    streamClass: preview.streamClass || null,
    focused: preview.focused === true,
    previewUrl: preview.previewUrl || "/app/",
    updatedAt: new Date().toISOString()
  };
}

export async function startArchive() {
  // TODO(archiving): replace this function with the code from the guide.
  throw new Error("TODO_NOT_IMPLEMENTED_ARCHIVING_START");
}

export async function stopArchive() {
  // TODO(archiving): replace this function with the code from the guide.
  throw new Error("TODO_NOT_IMPLEMENTED_ARCHIVING_STOP");
}

export async function getArchiveViewUrl() {
  // TODO(archiving): replace this function with the code from the guide.
  throw new Error("TODO_NOT_IMPLEMENTED_ARCHIVING_VIEW");
}

export function archiveNameForSession(sessionId) {
  return findRoomForSession(sessionId);
}
