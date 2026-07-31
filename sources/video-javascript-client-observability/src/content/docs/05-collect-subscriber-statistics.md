---
title: Collect Subscriber Statistics
description: Poll Subscriber.getStats for received media and sender-side estimates.
---

In `project/public/client-observability.js`, find `startSubscriberStats()`.

Subscriber statistics describe the media received by the browser. The monitor uses them for video bitrate, decoded frame rate, freezes, pauses, local network condition, and remote sender bandwidth.

Replace:

```js
// TODO: startSubscriberStats
```

with:

```js
const collect = () => {
  subscriber.getStats((error, stats) => {
    if (error) {
      onSample({ source: "subscriber", error: error.message });
      return;
    }

    onSample({
      source: "subscriber",
      stats
    });
  });
};

collect();
const intervalId = globalThis.setInterval(collect, 1000);
return () => globalThis.clearInterval(intervalId);
```

Save the file and reload the application.
