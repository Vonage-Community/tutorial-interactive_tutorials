---
title: Enable Sender Statistics
description: Publish sender-side estimates for subscribers to receive.
---

# Enable Sender-Side Statistics

Subscribers can receive the remote Publisher's bandwidth estimates only when the Publisher sends them. `publishSenderStats` is disabled by default.

In `getPublisherOptions()`, delete the `TODO` and the entire placeholder `return` block. Keep the function declaration and braces, then paste this code inside the function:

```js
return {
  insertMode: "append",
  width: "100%",
  height: "100%",
  publishSenderStats: true
};
```

The setting is applied when the prepared application calls `OT.initPublisher()`. Sender-side values can take time to arrive, so the first subscriber statistics sample may not contain `senderStats`.

Save the file, wait for the server to restart, and reload the Client Observability application.
