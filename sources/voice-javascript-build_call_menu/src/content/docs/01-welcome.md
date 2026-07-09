---
title: Welcome
description: Build a call menu (IVR) with the Vonage Voice API and Node.js in a GitHub Codespace.
---

# Build a Call Menu with the Vonage Voice API

In this exercise you will use the [Vonage Voice API](https://developer.vonage.com/en/voice/voice-api/overview) and Node.js to build an interactive call menu — sometimes called an IVR (Interactive Voice Response).

## What you will build

By the end of this exercise you will have a running Express server that:

- Answers an inbound call and reads out a menu.
- Listens for a DTMF keypress from the caller.
- Reads the current date and time aloud when the caller presses **1**.
- Repeats the menu when the caller presses any other key.

## What you need

- A [Vonage account](https://ui.idp.vonage.com/ui/auth/registration) with a Voice-capable virtual number.
- A Vonage Voice Application with webhook URLs pointing to this Codespace (you will configure these later).

## How it works

When someone calls your Vonage number, the Vonage API platform sends a request to your **answer URL**. Your server responds with an **NCCO** — a JSON array of call-control actions. The NCCO in this exercise plays a prompt and collects a single keypress. Vonage then sends that keypress to your **DTMF webhook**, and your server responds with the appropriate speech.
