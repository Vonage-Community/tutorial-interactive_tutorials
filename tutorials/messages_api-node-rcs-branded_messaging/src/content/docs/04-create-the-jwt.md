---
title: Create the JWT
description: Sign a short-lived JWT for the Messages API request.
---

Messages API requests made with a Vonage Application use **JWT authentication**. The JWT identifies the application and is signed with the matching private key.

In `project/server.js`, find `createMessagesJwt()`. Replace the `TODO` comment and the `throw new Error(...)` line inside the function with this code:

```js
const now = Math.floor(Date.now() / 1000);
const header = {
  alg: "RS256",
  typ: "JWT"
};
const payload = {
  application_id: config.applicationId,
  iat: now,
  exp: now + 900,
  jti: crypto.randomUUID()
};

const encodedHeader = base64Url(JSON.stringify(header));
const encodedPayload = base64Url(JSON.stringify(payload));
const signingInput = `${encodedHeader}.${encodedPayload}`;
const signature = crypto
  .createSign("RSA-SHA256")
  .update(signingInput)
  .sign(config.privateKey);

return `${signingInput}.${base64Url(signature)}`;
```

This creates a short-lived token for the application linked to your RCS sender.
