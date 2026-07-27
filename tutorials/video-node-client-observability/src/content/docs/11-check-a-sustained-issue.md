---
title: Check a Sustained Issue
description: Verify that consecutive unhealthy samples produce one actionable alert.
---

# Check a Sustained Issue

Select **Reset data**, then run **Sustained subscriber issue**. The scenario sends two `warning` samples followed by one `critical` sample for the same subscriber and stream.

The monitor should report one sustained issue with:

- `packetLoss` as the network condition reason,
- `local` as the degradation source,
- `3` consecutive samples.

The alert points to the subscriber's connection. It does not incorrectly attribute the problem to the remote publisher.

The backend can now distinguish a continuing subscriber problem from a short change in conditions.
