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
  from: config.fromNumber
};
```

The sender is the Vonage virtual number linked to your Messages application, and both phone numbers use E.164 format without a leading `+`.
