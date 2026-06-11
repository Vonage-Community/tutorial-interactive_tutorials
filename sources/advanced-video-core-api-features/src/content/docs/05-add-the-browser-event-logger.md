---
title: "Add the browser event logger"
description: "Debug timeline"
---

Replace `registerDebugLogging` with this snippet:

```js
export function registerDebugLogging({ session, postJson, getSessionId }) {
  const send = (type, detail = {}) => postJson("/api/debug/client-event", {
    type,
    sessionId: getSessionId(),
    detail
  }).catch(console.error);

  session.on("sessionConnected", () => send("clientSessionConnected"));
  session.on("streamCreated", (event) => send("clientStreamCreated", { streamId: event.stream.streamId }));
  session.on("streamDestroyed", (event) => send("clientStreamDestroyed", { streamId: event.stream.streamId }));
  session.on("sessionDisconnected", () => send("clientSessionDisconnected"));
}
```

Save the file.

> This adds browser lifecycle events such as connect, stream created, stream destroyed, and disconnect.
