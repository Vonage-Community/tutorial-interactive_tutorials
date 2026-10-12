---
title: Build the SMS Request
description: Add the required fields for a Messages API SMS request.
---

An SMS request needs the channel, message type, text, sender, and recipient. The SDK accepts camelCase property names and converts them to the Messages API request format.

In `project/server.js`, find `buildSmsPayload()`. Replace the `TODO` comment with:

```js
return {
  messageType: "text",
  channel: Channels.SMS,
  text,
  to: config.toNumber,
  from: config.senderId
};
```

The Sender ID can be an alphanumeric name or an SMS-capable number, depending on the rules for the destination country. The recipient number uses E.164 format without a leading `+`.
