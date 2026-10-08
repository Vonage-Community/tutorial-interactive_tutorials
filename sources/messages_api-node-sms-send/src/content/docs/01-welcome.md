---
title: Welcome
description: Send an SMS with the Vonage Messages API and capture its message UUID.
---

In this exercise, you will complete a small Node.js application that sends an **SMS message** through the Vonage **Messages API**.

The Codespace contains the Vonage Server SDK and a prepared application in `project/`. You will initialize the SDK client, build the SMS request, send a real message, and copy the `message_uuid` returned by the API.

Before you begin, make sure you have:

- a Vonage Application with the **Messages** capability enabled;
- the Application ID and private key for that application;
- an SMS-capable Vonage virtual number linked to the application;
- a destination phone number that can receive the test message.

If your Vonage account is in trial mode, the destination number must be registered as a verified test number in the Vonage Dashboard.
