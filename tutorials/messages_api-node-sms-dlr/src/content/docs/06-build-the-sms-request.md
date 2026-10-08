---
title: Build the SMS Request
description: Add the required fields for the test SMS.
---

The test message uses the standard Messages API SMS fields. Its status updates will go to the application-level Status URL you configured in the Dashboard.

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

The Messages API uses the sender and recipient to route the SMS, while `message_uuid` connects the send response to later status events.
