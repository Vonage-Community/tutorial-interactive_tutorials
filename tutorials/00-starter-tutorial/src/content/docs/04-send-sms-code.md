---
title: Send SMS Code
---

This code will send the SMS.

Copy into the bottom of `send-sms.js`

```js
vonage.messages.send(
    new SMS(
        'This is an SMS text message sent using the Messages API',
        TO_NUMBER,
        VONAGE_NUMBER,
    ),
)
.then(resp => console.log('SMS successfully sent. ID: ',resp.messageUUID))
.catch(err => console.error(err));
```
