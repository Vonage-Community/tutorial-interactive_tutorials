---
title: Log Status Events
description: Store the status webhook events sent by the Messages API.
---

After the message is accepted, Vonage sends status events to the `webhookUrl` in your request. These events show how the message moves through the delivery flow.

In `project/server.js`, find `recordStatusEvent()`. Replace the `TODO` comment with this code:

```js
const event = normalizeStatusEvent(rawEvent);

statusEvents.unshift(event);
statusEvents.splice(20);

return event;
```

The app keeps the latest events in memory and displays them in the RCS app. For this exercise, receiving any status for the sent message is enough to validate the webhook flow.
