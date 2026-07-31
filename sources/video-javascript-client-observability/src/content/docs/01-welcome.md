---
title: Welcome
description: Add pre-call checks and live quality monitoring to a Vonage Video API web application.
---

In this exercise, you will complete the browser-side observability features in a prepared Video API application. The application includes a waiting room, a live routed session, and a quality monitor.

By the end, the application will:

- Test connectivity and media quality before a user joins.
- Turn the test result into a `Pass`, `Warn`, or `Fail` status.
- Apply the recommended resolution and frame rate to the Publisher.
- Display publisher and subscriber statistics during the call.
- Report quality changes and identify whether subscriber degradation is local or remote.

You will edit `project/public/client-observability.js` and `project/public/pre-call.js`. The server and user interface are already prepared, so the exercise stays focused on the Web SDK and Network Test APIs.
