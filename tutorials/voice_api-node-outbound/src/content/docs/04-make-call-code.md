---
title: Make Call Code
---

This code will make the call. Copy into the bottom of `make-call.js`:

```js
vonage.voice.createOutboundCall({
    to: [{ type: 'phone', number: TO_NUMBER }],
    from: { type: 'phone', number: VONAGE_NUMBER },
    ncco: [
        {
            action: 'talk',
            text: 'Hello, this is an outbound call from the Vonage Voice API'
        }
    ]
})
    .then((resp) => console.log(resp))
    .catch((error) => console.error(error));
```

This uses the Vonage Node.js SDK to make an outbound call. If successful the response, containing the call UUID will be printed out to the console. Otherwise the error message will be printed out.
