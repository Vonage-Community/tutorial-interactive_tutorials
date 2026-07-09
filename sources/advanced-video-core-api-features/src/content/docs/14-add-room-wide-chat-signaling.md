---
title: "Add room-wide chat signaling"
description: "Signaling chat"
---

Update `setupSignalingChat`:

```js
  elements.chatForm.dataset.signalingChatReady = "true";
  if (elements.chatMessages.textContent === "Signaling chat is not implemented yet.") {
    elements.chatMessages.textContent = "";
  }

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
```

Save the file.

> `setupSignalingChat` listens for room-wide `msg` signals, renders incoming messages, and sends the form text through the Video API signal channel.
