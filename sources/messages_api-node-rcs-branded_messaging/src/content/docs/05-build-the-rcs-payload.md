---
title: Build the RCS Payload
description: Create the Messages API payload for a basic RCS text message.
---

A Messages API request sent through the SDK starts with the same core values: message type, channel, sender, recipient, and content. For this exercise, you also set `webhookUrl` so the status callback returns to this Codespace.

In `project/server.js`, find `buildRcsTextPayload()`. Replace the `TODO` comment with this code:

```js
return {
  messageType: "text",
  channel: Channels.RCS,
  text,
  to: config.toNumber,
  from: config.rcsSenderId,
  webhookUrl: `${baseUrl}/webhooks/status`
};
```

The SDK sends this as a Messages API RCS text request. It converts camelCase fields such as `messageType` and `webhookUrl` to the API field names in the outgoing request.
