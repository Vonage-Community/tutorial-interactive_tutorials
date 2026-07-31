---
title: Enable Sender Statistics
description: Publish sender-side estimates for subscribers to receive.
---

Open `project/public/client-observability.js` and find `getPublisherOptions()`.

This function returns the options passed to `OT.initPublisher()`. Enabling sender statistics lets Subscribers receive remote Publisher bandwidth estimates in their own statistics samples.

Replace:

```js
// TODO: getPublisherOptions
```

with:

```js
return {
  insertMode: "append",
  width: "100%",
  height: "100%",
  publishSenderStats: true
};
```

Save the file and reload the Client Observability application after the server restarts.
