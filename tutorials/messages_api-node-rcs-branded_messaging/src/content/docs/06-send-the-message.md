---
title: Send the Message
description: Send the RCS text message with the Vonage Server SDK.
---

Now send the text message with the SDK client you initialized earlier. The SDK signs the request for you.

In `project/server.js`, find `sendRcsText()`. Replace the `TODO` comment with this code:

```js
const vonage = initializeMessagesClient(config);
const payload = buildRcsTextPayload(config, text, baseUrl);
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
  webhookUrl: payload.webhookUrl,
  sentAt: new Date().toISOString()
};

sentMessages.unshift(sentMessage);
sentMessages.splice(10);

return sentMessage;
```

The response confirms that Vonage accepted the request and returns the message UUID used to match later status events.
