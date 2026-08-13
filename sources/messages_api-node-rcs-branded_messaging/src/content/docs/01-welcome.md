---
title: Welcome
description: Send a basic RCS text message with the Vonage Messages API in a GitHub Codespace.
---

In this exercise, you will send a basic **RCS text message** through the Vonage **Messages API** and receive the related **status webhook** events in a small Node.js app.

Your Codespace contains a starter project in `project/`. You will add the JWT, request payload, send request, and status webhook logic step by step.

Before you begin, make sure you have:

- a Vonage Application with **Messages** capability connected to your RCS agent;
- the Application ID and private key for that same application;
- the RCS agent Sender ID, also called the `vonage_id`, associated with that application;
- an RCS-capable test phone number. If your agent is still in testing, the number must be added as a test device for that agent.

If the Application ID and private key belong to a different application than the one connected to your RCS agent, the Messages API can reject the request with an authorization error.

This exercise uses the real Messages API endpoint, not the Messages API Sandbox.
