---
title: Read Degradation Source
description: Compare the subscriber's local network with the remote publisher's network.
---

# Read the Subscriber Degradation Source

Subscriber media-link statistics distinguish the local downlink from the remote publisher's uplink. This helps determine which participant should investigate the network problem.

In `readSubscriberNetwork()`, delete the `TODO` and the entire placeholder `return` block. Paste this code inside the existing function:

```js
const mediaLink = stats?.mediaLink ?? {};
return {
  source: mediaLink.networkDegradationSource ?? "unknown",
  localCondition: mediaLink.transport?.networkCondition ?? "unknown",
  remoteCondition:
    mediaLink.remotePublisherTransport?.networkCondition ?? "unknown"
};
```

The source can be `local`, `remote`, `bothOrUnclear`, or `unknown`. Keep both conditions in the result so an unclear case still has useful context.

Save the file, wait for the restart, and reload the application. The four checks for live statistics and events should now be complete.
