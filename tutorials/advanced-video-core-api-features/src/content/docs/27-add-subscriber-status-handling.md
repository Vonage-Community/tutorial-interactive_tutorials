---
title: "Add subscriber status handling"
description: "Subscriber quality"
---

# Add subscriber status handling

Replace `setupSubscriberQuality` with this snippet:

```js
export function setupSubscriberQuality({ session, elements, postJson }) {
  const setState = (state, reason, recovered = false) => {
    elements.subscriberStatus.textContent = `Subscriber status: ${state}`;
    postJson("/api/diagnostics/subscriber", { state, reason, recovered }).catch(console.error);
  };

  setState("normal", "subscriber connected");

  session.on("streamDestroyed", () => setState("ended", "stream destroyed"));

  elements.simulateDegraded.onclick = () => setState("degraded", "prepared test action");
  elements.simulateRecovered.onclick = () => setState("normal", "prepared recovery action", true);
}
```

Save the file.

> The lesson is about reacting to subscriber quality changes. The workspace uses prepared buttons so you do not need to break your network on purpose.
