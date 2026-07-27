---
title: Open the Monitoring File
description: Locate the four backend functions used by the exercise.
---

# Open the Monitoring File

Open:

```text
project/src/monitoring.js
```

The file contains functions for normalization, session summaries, alert detection, and support correlation. Helper functions at the bottom already handle condition checks, timestamp sorting, and time-window comparisons.

Start with `normalizeTelemetry()`, which prepares each incoming record before it is stored.
