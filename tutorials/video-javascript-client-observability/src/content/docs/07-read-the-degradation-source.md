---
title: Read Degradation Source
description: Compare the subscriber's local network with the remote publisher's network.
---

In `project/public/client-observability.js`, find `readSubscriberNetwork()`.

Subscriber media-link statistics can show whether degradation is local to the Subscriber, remote on the Publisher side, both, or unclear. Returning both network conditions gives the monitor useful context even when there is no single clear source.

Replace:

```js
// TODO: readSubscriberNetwork
```

with:

```js
const mediaLink = stats?.mediaLink ?? {};
return {
  source: mediaLink.networkDegradationSource ?? "unknown",
  localCondition: mediaLink.transport?.networkCondition ?? "unknown",
  remoteCondition:
    mediaLink.remotePublisherTransport?.networkCondition ?? "unknown"
};
```

Save the file and reload the application.
