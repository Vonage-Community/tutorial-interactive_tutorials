---
title: Send the Message
description: Post the RCS payload to the Messages API.
---

Now send the payload to the Messages API with the JWT you created in the previous step.

In `project/server.js`, find `sendRcsText()`. Replace the `TODO` comment and the `throw new Error(...)` line inside the function with this code:

```js
const jwt = createMessagesJwt(config);
const payload = buildRcsTextPayload(config, text, baseUrl);

const response = await fetch(config.messagesApiUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const rawBody = await response.text();
let responseBody = {};

try {
  responseBody = rawBody ? JSON.parse(rawBody) : {};
} catch {
  responseBody = { raw: rawBody };
}

if (!response.ok) {
  throw new Error(
    `Messages API returned ${response.status}: ${JSON.stringify(responseBody)}`
  );
}

const messageUuid = responseBody.message_uuid;

if (!messageUuid) {
  throw new Error("Messages API response did not include message_uuid.");
}

const sentMessage = {
  messageUuid,
  clientRef: payload.client_ref,
  from: payload.from,
  to: payload.to,
  text: payload.text,
  webhookUrl: payload.webhook_url,
  sentAt: new Date().toISOString()
};

sentMessages.unshift(sentMessage);
sentMessages.splice(10);

return sentMessage;
```

The response confirms that Vonage accepted the request and returns the `message_uuid` used to match later status events.
