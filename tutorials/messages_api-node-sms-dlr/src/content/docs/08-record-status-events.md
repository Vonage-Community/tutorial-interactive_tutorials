---
title: Record Status Events
description: Store the callbacks posted to the status webhook.
---

The prepared webhook handler acknowledges each callback with HTTP `204`. Complete the function that normalizes and stores the callback body for the monitor.

In `project/server.js`, find `recordStatusEvent()`. Replace the `TODO` comment with:

```js
const event = normalizeStatusEvent(rawEvent);

statusEvents.unshift(event);
statusEvents.splice(20);

return event;
```

Each event retains its `message_uuid`, status, timestamp, sender, and recipient. The monitor compares that UUID with the messages sent from the current Codespace.
