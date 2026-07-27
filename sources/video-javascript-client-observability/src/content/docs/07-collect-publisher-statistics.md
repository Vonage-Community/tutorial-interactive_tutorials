---
title: Collect Publisher Statistics
description: Poll Publisher.getStats and stop the timer when the call ends.
---

# Collect Publisher Statistics

`Publisher.getStats()` returns an array. In the routed session used by this exercise, the array contains one statistics container for the stream sent to the Media Router.

In `startPublisherStats()`, delete the `TODO` and `return () => {};`. Keep the function declaration and braces, then paste this code inside the function:

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

The application calls the returned cleanup function when the user leaves, so polling does not continue after the Publisher is destroyed.

Save the file, wait for the restart, and reload the application. The first implementation check now confirms both the Publisher options and statistics callback.
