const rooms = new Map();
const activity = {
  preCallSessionIds: new Set(),
  publisherSessionIds: new Set(),
  subscriberSessionIds: new Set()
};

export function getRoomSession(roomName) {
  return rooms.get(roomName);
}

export function rememberRoomSession(roomName, sessionId) {
  rooms.set(roomName, sessionId);
}

export function recordExerciseActivity({ type, sessionId }) {
  if (typeof sessionId !== "string" || sessionId.length === 0) {
    return false;
  }

  const target = {
    "pre-call-complete": activity.preCallSessionIds,
    "publisher-stats": activity.publisherSessionIds,
    "subscriber-stats": activity.subscriberSessionIds
  }[type];

  if (!target) {
    return false;
  }

  target.add(sessionId);
  return true;
}

export function getExerciseActivity() {
  return {
    preCallSessionIds: [...activity.preCallSessionIds],
    publisherSessionIds: [...activity.publisherSessionIds],
    subscriberSessionIds: [...activity.subscriberSessionIds]
  };
}
