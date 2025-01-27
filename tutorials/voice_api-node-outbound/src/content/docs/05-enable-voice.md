---
title: Enable Voice
---

To make a call, you need to enable the voice capability on your Vonage application. Copy this code into the `enable-voice.js` file:

```js
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: process.env.VONAGE_PRIVATE_KEY,
});

vonage.applications.getApplication(process.env.VONAGE_APPLICATION_ID)
    .then((app) => {
        app.capabilities = {
            voice: {}
        }
        vonage.applications.updateApplication(app)
            .then(() => console.log("App Updated"))
            .catch((error) => console.dir(error));
    })
    .catch((error) => console.error(error));
```

Then run this command in the Terminal:

```sh
node enable-voice.js
```

