---
title: Check the Starter Project
description: Review the prepared Express application and the file you will complete.
---

# Check the Starter Project

The Codespace contains a working Express application in `project/`. The server, telemetry fixtures, in-memory store, and monitoring interface are already prepared.

{% filetree %}

- project/
  - public/
    - app.js
    - index.html
    - styles.css
  - src/
    - exercise-validation.js
    - fixtures.js
    - monitoring.js
    - telemetry-store.js
  - package.json
  - server.js

{% /filetree %}

You will edit only `project/src/monitoring.js`. Its four `TODO` comments correspond to the four checks shown at the top of the monitor.

The surrounding application lets you concentrate on how telemetry is processed after it reaches your backend.
