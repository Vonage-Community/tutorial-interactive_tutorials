---
title: Send the SMS
description: Send the request with the Vonage Server SDK and store the message UUID.
---

The Messages API returns a `message_uuid` when it accepts the request. The SDK exposes that value as `messageUUID`.

In `project/server.js`, find `sendSms()`. Replace the `TODO` comment with:

```js
const vonage = initializeMessagesClient(config);
const payload = buildSmsPayload(config, text);
const response = await vonage.messages.send(payload);
const messageUuid = response.messageUUID || response.message_uuid;

if (!messageUuid) {
  throw new Error("Messages API response did not include a message UUID.");
}

return {
  messageUuid,
  from: payload.from,
  to: payload.to,
  text: payload.text,
  sentAt: new Date().toISOString()
};
```

The returned UUID identifies this message and can be used later to match status callbacks and search the Messages API logs.
