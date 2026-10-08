---
title: Send the SMS
description: Send the test message and keep its message UUID for correlation.
---

Store the UUID returned by the Messages API so the monitor can recognize callbacks for this specific message.

In `project/server.js`, find `sendSms()`. Replace the `TODO` comment with:

```js
const vonage = initializeMessagesClient(config);
const payload = buildSmsPayload(config, text);
const response = await vonage.messages.send(payload);
const messageUuid = response.messageUUID || response.message_uuid;

if (!messageUuid) {
  throw new Error("Messages API response did not include a message UUID.");
}

const sentMessage = {
  messageUuid,
  from: payload.from,
  to: payload.to,
  text: payload.text,
  sentAt: new Date().toISOString()
};

sentMessages.unshift(sentMessage);
sentMessages.splice(10);

return sentMessage;
```

The stored UUID becomes the correlation key used by the status callback check.
