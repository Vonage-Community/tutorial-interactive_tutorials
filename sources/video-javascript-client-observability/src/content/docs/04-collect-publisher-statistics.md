---
title: Collect Publisher Statistics
description: Poll Publisher.getStats and stop the timer when the call ends.
---

In `project/public/client-observability.js`, find `startPublisherStats()`.

This function samples the local Publisher once per second. Each `Publisher.getStats()` response is sent to the application so the monitor can display outgoing bitrate, frame rate, bandwidth estimate, and network condition.

Replace:

```js
// TODO: startPublisherStats
```

with:

```js
const collect = () => {
  publisher.getStats((error, statsArray) => {
    if (error) {
      onSample({ source: "publisher", error: error.message });
      return;
    }

    for (const statsContainer of statsArray) {
      onSample({
        source: "publisher",
        stats: statsContainer.stats
      });
    }
  });
};

collect();
const intervalId = globalThis.setInterval(collect, 1000);
return () => globalThis.clearInterval(intervalId);
```

The returned cleanup function stops polling when the user leaves the call. Save the file and reload the application.
