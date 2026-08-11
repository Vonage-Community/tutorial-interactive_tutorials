---
title: Build the RCS Payload
description: Create the Messages API payload for a basic RCS text message.
---

An RCS text message uses the standard Messages API send flow. The important RCS-specific values are the `rcs` channel and the RCS Sender ID in `from`.

In `project/server.js`, find `buildRcsTextPayload()`. Replace the `TODO` comment and the `throw new Error(...)` line inside the function with this code:

```js
return {
  from: config.rcsSenderId,
  to: config.toNumber,
  channel: "rcs",
  message_type: "text",
  text,
  client_ref: `rcs-${crypto.randomUUID()}`,
  webhook_url: `${baseUrl}/webhooks/status`,
  rcs: {
    category: config.rcsCategory
  }
};
```

The `webhook_url` points back to this Codespace for this message only, so you do not need to change the Status URL in the Vonage Dashboard for this exercise.
