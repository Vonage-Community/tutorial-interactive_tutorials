---
title: "Add room-wide chat signaling"
description: "Signaling chat"
---

Replace `setupSignalingChat` with this snippet:

```js
export function setupSignalingChat({ session, elements, postJson }) {
  const render = (from, text) => {
    const line = document.createElement("p");
    line.textContent = `${from}: ${text}`;
    elements.chatMessages.append(line);
  };

  session.on("signal:msg", (event) => {
    render(event.from.connectionId === session.connection.connectionId ? "Me" : "Peer", event.data);
    postJson("/api/activity", {
      type: "signal:msg",
      data: event.data,
      roomWide: true,
      from: event.from.connectionId
    }).catch(console.error);
  });

  elements.chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = elements.chatInput.value.trim();
    if (!data) return;
    session.signal({ type: "msg", data });
    elements.chatInput.value = "";
  });
}
```

Save the file.

> This follows the signaling lesson: use Video API signals to send small room-wide messages.
