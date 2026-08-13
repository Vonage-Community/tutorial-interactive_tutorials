---
title: Build the Rich Card Payload
description: Create the Messages API payload for an RCS rich card.
---

A Messages API request sent through the SDK still starts with the same core values: message type, channel, sender, recipient, and content. For this exercise, you also set `webhookUrl` so the status callback returns to this Codespace.

In `project/server.js`, find `buildRichCardPayload()`. Replace the `TODO` comment and the `throw new Error(...)` line inside the function with this code:

```js
return {
  messageType: "card",
  channel: Channels.RCS,
  to: config.toNumber,
  from: config.rcsSenderId,
  webhookUrl: `${baseUrl}/webhooks/status`,
  card: {
    title: "Explore Vonage RCS",
    text: "This rich card was sent from a GitHub Codespace with the Vonage Messages API.",
    mediaUrl: `${baseUrl}/assets/vonage-logo.png`,
    mediaDescription: "Vonage logo",
    mediaHeight: "SHORT",
    suggestions: [
      {
        type: "suggested_reply",
        text: "Tell me more",
        postbackData: "rich_card_more"
      },
      {
        type: "suggested_reply",
        text: "Not now",
        postbackData: "rich_card_later"
      }
    ]
  },
  rcs: {
    cardOrientation: "VERTICAL"
  }
};
```

The SDK sends this as a Messages API rich card request. It converts camelCase fields such as `messageType`, `mediaUrl`, and `webhookUrl` to the API field names in the outgoing request.
