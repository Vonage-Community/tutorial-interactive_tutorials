---
title: Build the Rich Card Payload
description: Create the Messages API payload for an RCS rich card.
---

A Messages API request sent through the SDK starts with the same core values: message type, channel, sender, recipient, and content. For RCS rich cards, the Node.js SDK sends the card as a custom RCS content message.

In `project/server.js`, find `buildRichCardPayload()`. Replace the `TODO` comment with this code:

```js
return {
  messageType: "custom",
  channel: Channels.RCS,
  to: config.toNumber,
  from: config.rcsSenderId,
  webhookUrl: `${baseUrl}/webhooks/status`,
  custom: {
    contentMessage: {
      richCard: {
        standaloneCard: {
          thumbnailImageAlignment: "RIGHT",
          cardOrientation: "VERTICAL",
          cardContent: {
            title: "Explore Vonage RCS",
            description: "This rich card was sent from a GitHub Codespace with the Vonage Messages API.",
            media: {
              height: "SHORT",
              contentInfo: {
                fileUrl: `${baseUrl}/assets/vonage-logo.png`,
                forceRefresh: false
              }
            },
            suggestions: [
              {
                reply: {
                  text: "Tell me more",
                  postbackData: "rich_card_more"
                }
              },
              {
                reply: {
                  text: "Not now",
                  postbackData: "rich_card_later"
                }
              }
            ]
          }
        }
      }
    }
  }
};
```

The custom object follows the RCS rich card structure used by the Node.js SDK. The `webhookUrl` still points status events back to this Codespace.
