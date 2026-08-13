---
title: Initialize the SDK Client
description: Create a Vonage SDK client for Messages API requests.
---

The Vonage Server SDK handles authentication for Messages API requests. Your code only needs to initialize the client with the Application ID and private key from the Messages application connected to your RCS agent.

In `project/server.js`, find `initializeMessagesClient()`. Replace the `TODO` comment and the `throw new Error(...)` line inside the function with this code:

```js
return new Vonage({
  applicationId: config.applicationId,
  privateKey: config.privateKey
});
```

The rest of the exercise uses this client to send the RCS text message.
