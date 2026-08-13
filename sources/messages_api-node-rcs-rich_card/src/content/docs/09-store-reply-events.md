---
title: Store Reply Events
description: Store the inbound suggested reply events sent to your webhook.
---

When the recipient taps a suggested reply, Vonage sends an inbound message to the application **Inbound URL**. For suggested replies, the `postback_data` value is returned as the reply `id`.

In `project/server.js`, find `recordInboundEvent()`. Replace the `TODO` comment and the `throw new Error(...)` line inside the function with this code:

```js
const event = normalizeInboundEvent(rawEvent);

inboundEvents.unshift(event);
inboundEvents.splice(20);

return event;
```

The app displays the reply title and postback data so you can confirm which suggestion was selected.
