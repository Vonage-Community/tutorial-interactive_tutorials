---
title: Listen for Quality Changes
description: Handle video quality and network condition changes.
---

In `project/public/client-observability.js`, find `observeQualityChanges()`.

Statistics polling gives the monitor regular samples. These event handlers add signal when the SDK reports a meaningful video quality or network condition change, and the cleanup function removes the handlers when the call ends.

Replace:

```js
// TODO: observeQualityChanges
```

with:

```js
const videoQualityHandler = (event) => {
  onChange({
    source,
    type: "videoQualityChanged",
    reason: event.reason,
    stats: event.stats ?? event.statsContainer?.stats ?? {}
  });
};
const networkConditionHandler = (event) => {
  onChange({
    source,
    type: "networkConditionChanged",
    reason: event.reason,
    stats: event.stats ?? event.statsContainer?.stats ?? {}
  });
};

target.on("videoQualityChanged", videoQualityHandler);
target.on("networkConditionChanged", networkConditionHandler);

return () => {
  target.off("videoQualityChanged", videoQualityHandler);
  target.off("networkConditionChanged", networkConditionHandler);
};
```

Save the file and reload the application.
