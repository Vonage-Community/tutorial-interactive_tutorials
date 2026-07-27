---
title: Open Pre-Call Testing
description: Locate the functions that control the waiting-room result.
---

# Open the Pre-Call File

Open:

```text
project/public/pre-call.js
```

The prepared backend creates a new routed test session whenever the waiting room requests `/api/pre-call/session`. This session is separate from the communication session, so test connections do not appear as participants in the call.

You will run the two Network Test stages, set the waiting-room status, and return the Publisher settings recommended by the quality test.

As before, keep each function declaration and its braces. Remove the complete placeholder body before pasting the code from the matching step.
