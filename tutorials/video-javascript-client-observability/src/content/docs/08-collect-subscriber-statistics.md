---
title: Collect Subscriber Statistics
description: Poll Subscriber.getStats for received media and sender-side estimates.
---

# Collect Subscriber Statistics

Subscriber statistics describe the media received by the browser. They can include video bitrate, decoded frame rate, freezes, pauses, local transport data, and sender-side estimates from the remote Publisher.

In `startSubscriberStats()`, delete the `TODO` and `return () => {};`. Paste this code inside the existing function:

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

The quality monitor can now update its Subscriber view once per second. Save the file, wait for the restart, and reload the application.
