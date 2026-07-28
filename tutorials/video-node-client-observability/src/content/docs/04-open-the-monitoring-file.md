---
title: Open the Monitoring File
description: Locate the four backend functions used by the exercise.
---

Open:

```text
project/src/monitoring.js
```

The file contains functions for normalization, session summaries, alert detection, and support correlation. Helper functions at the bottom already handle condition checks, timestamp sorting, and time-window comparisons.

Each function contains one `TODO` comment. In the next steps, replace those comments with the implementation code from the guide.

Start with `normalizeTelemetry()`, which prepares each client record before the backend stores it.
