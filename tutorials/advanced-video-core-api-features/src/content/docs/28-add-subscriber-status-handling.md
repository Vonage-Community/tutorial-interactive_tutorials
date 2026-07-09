---
title: "Add subscriber status handling"
description: "Subscriber quality"
---

Update `setupSubscriberQuality`:

```js
  elements.subscriberStatus.dataset.subscriberQualityReady = "true";

  const setState = (state, reason, recovered = false) => {
    elements.subscriberStatus.textContent = `Subscriber status: ${state}`;
    postJson("/api/diagnostics/subscriber", { state, reason, recovered }).catch(console.error);
  };

  setState("normal", "subscriber connected");

  session.on("streamDestroyed", () => setState("ended", "stream destroyed"));

  elements.simulateDegraded.onclick = () => setState("degraded", "prepared test action");
  elements.simulateRecovered.onclick = () => setState("normal", "prepared recovery action", true);
```

Save the file.

> `setupSubscriberQuality` updates the subscriber status in the UI and records each normal, degraded, or recovered state for diagnostics.
