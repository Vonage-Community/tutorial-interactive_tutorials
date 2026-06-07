const MAX_ITEMS = 50;

export const state = {
  rooms: new Map(),
  debugTimeline: [],
  activityMessages: [],
  publisherDiagnostics: {
    profile: "Balanced",
    applied: false,
    settings: {}
  },
  subscriberDiagnostics: {
    history: []
  },
  recording: {
    layout: null,
    streamClass: null,
    focused: false,
    previewUrl: null,
    updatedAt: null
  },
  latestArchive: {
    archiveId: null,
    state: "idle",
    viewUrl: null,
    updatedAt: null
  }
};

export function pushLimited(list, item) {
  list.push({ ...item, at: new Date().toISOString() });
  if (list.length > MAX_ITEMS) {
    list.splice(0, list.length - MAX_ITEMS);
  }
}

export function rememberRoomSession(roomName, sessionId) {
  state.rooms.set(roomName, sessionId);
}

export function findRoomForSession(sessionId) {
  for (const [roomName, value] of state.rooms.entries()) {
    if (value === sessionId) {
      return roomName;
    }
  }
  return "advanced-room";
}
