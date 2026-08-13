---
title: Test the RCS Message
description: Send the RCS text message and review the status webhook.
---

Reload the RCS app in the browser tab you opened from port `3000`. The credential check should be green, and the remaining checks will turn green as the app sends the message and receives a status event.

In the message form, keep the default text or enter a short test message. Select **Send RCS message**.

The page should show:

- the message UUID returned by the Messages API;
- the status webhook URL used for this message;
- at least one status event after Vonage sends the callback.

Status callbacks may arrive a few seconds after the API accepts the message. If no event appears, confirm that port `3000` is public and that the recipient number is RCS-capable or added as a test device for your agent.
