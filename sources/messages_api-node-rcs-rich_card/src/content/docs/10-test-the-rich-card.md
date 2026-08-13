---
title: Test the Rich Card
description: Send the rich card and tap one of the suggested replies.
---

Reload the RCS Rich Card App after saving `project/server.js`. The implementation check for SDK client initialization should now pass.

Select **Send RCS rich card**. When the rich card arrives on your RCS test device, tap one of the suggested replies.

Back in the app, check that:

- **Messages API accepted an RCS rich card request** is green;
- a **status webhook** appears in the Status events table;
- the suggested reply appears in the Inbound replies table.

If the message is rejected, confirm that the RCS sender is connected to the same Vonage Application used in this exercise and that the recipient number is allowed to receive test traffic from your agent.
