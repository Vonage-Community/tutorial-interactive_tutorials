---
title: Create the JWT
description: Sign a short-lived JWT for the Messages API request.
---

Messages API requests made with a Vonage Application use **JWT authentication**. The starter project imports the Vonage JWT helper so the token is generated in the same format used by the Vonage Node tools.

In `project/server.js`, find `createMessagesJwt()`. Replace the `TODO` comment and the `throw new Error(...)` line inside the function with this code:

```js
return tokenGenerate(config.applicationId, config.privateKey, {
  exp: Math.floor(Date.now() / 1000) + 900
});
```

This creates a short-lived token for the application linked to your RCS sender.
