---
title: Open the Quality Monitor
description: Confirm that the prepared backend and monitoring interface are running.
---

# Open the Quality Monitor

The **Simple Browser** displays this exercise guide. The **Video Quality Monitor** is a separate application running on port **3000**.

To open the Video Quality Monitor:

1. Select the **Ports** tab in the bottom panel, next to **Terminal**.
2. Find port **3000**.
3. Select the generated **Forwarded Address** for port 3000 to open the Video Quality Monitor in a browser tab.

If port 3000 is not listed, open a terminal and run:

```sh
cd project && npm start
```

Leave this terminal open, then return to **Ports** and open the forwarded address for port 3000.

The server restarts whenever you save `monitoring.js`. Reload the Video Quality Monitor in its browser tab after each restart so that it shows the latest check results.

The five checks at the top of the monitor are initially incomplete.
