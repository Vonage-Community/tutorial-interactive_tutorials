---
title: Initialize the SDK Client
description: Create a Vonage SDK client for Messages API requests.
---

The Vonage Server SDK creates the JWT used to authenticate the request. Your code only needs to initialize the client with the Application ID and private key.

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

The application can now create authenticated Messages API requests without generating a token manually.
