---
title: Initialize the SDK Client
description: Create a Vonage SDK client for the test SMS request.
---

The Vonage Server SDK creates the JWT used to authenticate the request. Your code only needs the Application ID and private key.

In `project/server.js`, find `initializeMessagesClient()`. Replace the `TODO` comment with:

```js
return new Vonage(
  {
    applicationId: config.applicationId,
    privateKey: config.privateKey
  },
  {
    apiHost: config.messagesApiHost
  }
);
```

The same Vonage Application supplies the credentials used for sending and the Status URL used for callbacks.
