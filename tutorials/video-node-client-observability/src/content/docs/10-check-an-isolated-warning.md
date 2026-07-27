---
title: Check an Isolated Warning
description: Confirm that one warning does not create an operational alert.
---

# Check an Isolated Warning

Select **Reset data**, then run **Isolated warning**. This scenario sends one `warning` sample followed by a `good` sample.

The summary counts the warning, but **Sustained issues** should remain empty. The healthy sample resets the sequence before it reaches the alert threshold.

This distinction lets the dashboard retain short quality changes without notifying an operations team about every callback.

The alert rule now treats an isolated warning as session history rather than an incident.
