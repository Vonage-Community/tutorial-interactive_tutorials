---
title: "Add the server callback logger"
description: "Debug timeline"
---

Update `recordClientDebugEvent`:

```js
  pushLimited(state.debugTimeline, {
    source: "client",
    type: event.type,
    sessionId: event.sessionId || null,
    detail: event.detail || {}
  });
```

Update `recordVideoCallback`:

```js
  pushLimited(state.debugTimeline, {
    source: "callback",
    type: payload.event || payload.type || "videoCallback",
    sessionId: payload.sessionId || payload.session_id || null,
    detail: payload
  });
```

Save the file.

> This connects browser events and Video callback events into one timeline.
