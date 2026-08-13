---
title: Welcome
description: Send an RCS rich card with a Vonage logo and handle the suggested reply.
---

In this exercise, you will send an **RCS rich card** through the Vonage **Messages API**. The card includes a small Vonage logo, supporting text, and two suggested replies.

Your Codespace contains a starter project in `project/`. You will initialize the SDK client, add the rich card payload, send the request, and handle the status and inbound reply webhooks step by step.

Before you begin, make sure you have:

- a Vonage Application with **Messages** capability connected to your RCS agent;
- the Application ID and private key for that same application;
- the RCS agent Sender ID, also called the `vonage_id`, associated with that application;
- an RCS-capable test phone number. If your agent is still in testing, the number must be added as a test device for that agent.

If the Application ID and private key belong to a different application than the one connected to your RCS agent, the Messages API can reject the request with an authorization error.

This exercise uses the real Messages API endpoint, not the Messages API Sandbox.
