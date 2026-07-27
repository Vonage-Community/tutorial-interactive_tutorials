---
title: Listen for Quality Changes
description: Handle meaningful video quality and network condition changes.
---

# Listen for Quality Changes

Polling shows a regular history. The `videoQualityChanged` and `networkConditionChanged` events report meaningful changes without treating every statistics sample as an alert.

In `observeQualityChanges()`, delete the `TODO` and `return () => {};`. Paste this code inside the existing function:

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

Publisher events provide their data in `statsContainer`; subscriber events use `stats`. The fallback handles both forms while keeping one event handler for the application.

Save the file, wait for the restart, and reload the application.
