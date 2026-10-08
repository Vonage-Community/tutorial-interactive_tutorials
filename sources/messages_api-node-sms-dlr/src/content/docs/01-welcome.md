---
title: Welcome
description: Receive an SMS status callback and match it to a message sent through the Messages API.
---

In this exercise, you will complete a small Node.js application that sends an **SMS message** and receives the related **status callback** from the Vonage **Messages API**.

The Codespace contains a prepared status webhook and the Vonage Server SDK. You will complete the send logic, store incoming status events, and use `message_uuid` to match a callback to the message that triggered it.

Before you begin, make sure you have:

- a Vonage Application with the **Messages** capability enabled;
- the Application ID and private key for that application;
- an SMS-capable Vonage virtual number linked to the application;
- a destination phone number that can receive the test message.

If your Vonage account is in trial mode, the destination number must be registered as a verified test number in the Vonage Dashboard.
