---
title: Open the Quality Monitor
description: Confirm that the prepared backend and monitoring interface are running.
---

# Open the Quality Monitor

The Codespace starts the backend automatically. Open the **Preview** tab and confirm that the **Video Quality Monitor** is visible.

All four checks initially show an empty circle. This is expected because the functions in `monitoring.js` still contain starter implementations.

If the server is not running, open a terminal and run:

```sh
cd project && npm start
```

Leave the server terminal running. The `--watch` option restarts the application whenever you save `monitoring.js`.

The monitor is ready for the first telemetry record.
