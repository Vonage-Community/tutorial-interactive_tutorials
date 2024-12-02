---
title: Initialize the Client and Variables
---

In this step, we will intialize the Vonage Client with some credentials and initialize some variables that will be needed later.

| Key             | Description                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `VONAGE_NUMBER` | The phone number you are sending the message from. This is the number rented from Vonage when setting up the application. |
| `TO_NUMBER`     | The phone number you are sending the message to.                                                                          |

> Note: If your account is in the trial period, the `TO_NUMBER` can only be the phone number that you used to create the account. Also, don't use a leading + or 00 when entering a phone number, start with the country code, for example 447700900000.

Copy this code into `send-sms.js`

```js
const { Vonage } = require('@vonage/server-sdk');
const { SMS } = require('@vonage/messages');

const TO_NUMBER = ''
const VONAGE_NUMBER = process.env.VONAGE_NUMBER;

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});

```
