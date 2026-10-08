---
title: Test the Status Callback
description: Send an SMS and review the matching status event.
---

Reload the **SMS Status Monitor**. The credential and SDK checks should be green.

Keep the default text or enter a short message, then select **Send test SMS**. The Messages API returns a message UUID, and Vonage posts status changes to the Status URL configured for your application.

Select **Refresh status events** until the monitor displays a callback with the same UUID as the sent message. The first event is commonly `submitted`; a later event may be `delivered` or `rejected`.

Receiving `delivered` is not required to complete the exercise. Delivery receipts depend on the destination network, so a matching `submitted` or `rejected` callback also confirms that your webhook flow works.
