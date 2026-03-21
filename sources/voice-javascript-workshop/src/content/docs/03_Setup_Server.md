---
title: Setup Server
description: Set up the server
---

Let's get the server running.  The server will:
- create a user and generate a token so that applications can make and receive voice calls
- return an <a href="https://developer.vonage.com/en/voice/voice-api/ncco-reference" target="_blank">NCCO</a> (instructions on how to handle the call) when Vonage makes a request to your endpoint

The following code will be placed in the `index.js` file.

Use the Vonage Node SDK library to generate tokens (`// ⌄⌄⌄ Vonage SDK library to generate tokens ⌄⌄⌄`):
```js
const { tokenGenerate } = require('@vonage/jwt')
```

Next, we'll create an instance of the Vonage SDK using the credentials you've set earlier and set a variable for your Vonage phone number (`// ⌄⌄⌄ Create an instance of the Vonage SDK and set your Vonage phone number ⌄⌄⌄`):
```js
const { Vonage } = require('@vonage/server-sdk');
const vonageCredentials = {
  applicationId: appId,
  privateKey: privateKey
};
const vonage = new Vonage(vonageCredentials);

const vonageNumber = process.env.VONAGE_PHONE_NUMBER;
```

When using a client application (Web, Android, iOS) to make and receive voice calls, a user will need to be created. Here's the function that will do that (`// ⌄⌄⌄ Function to create a User ⌄⌄⌄`):
```js
async function createUser(displayName) {
  const username = displayName.toLowerCase().replaceAll(" ", "-");
  try {
    await vonage.users.createUser({
      'name': username,
      'displayName': displayName,
    });
    return username;
  } catch (error) {
    // User already exists, proceed with existing username
    return username;
  }
}
```

Let's set the route that the application will call and return the token for the User of the application to use. The token will have the permissions (<a href="https://developer.vonage.com/en/getting-started/concepts/authentication" target="_blank">ACL paths</a>) that the User has access to (`// ⌄⌄⌄ Route to generate a token for the User ⌄⌄⌄`):
```js
app.get('/token', async (req, res) => {
  const displayName = req.query.name;
  if (!displayName) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }

  const username = await createUser(displayName);
  console.log(`Generating token for user: ${username}`);
  userLoggedIn = username;

  const aclPaths = {
    "paths": {
        "/*/rtc/**": {},
        "/*/sessions/**": {},
        "/*/conversations/**": {},
        "/*/knocking/**": {},
        "/*/legs/**": {},
    }
  }
  const token = tokenGenerate(appId, privateKey, {
    //expire in 24 hours
    exp: Math.round(new Date().getTime()/1000)+86400,
    sub: username,
    acl: aclPaths,
  });

  res.json({ token: token });
});
```

Using the Wehook endpoints set while creating the Vonage Application earlier, Vonage will send a request to your "Answer" webhook when a call is initiated so Vonage knows how to handle the call (`// ⌄⌄⌄ Answer Webhook ⌄⌄⌄`):
```js
app.get('/voice/answer', (req, res) => {
  console.log('NCCO request:', req.query);
  console.log(`  - callee: ${req.query.to}`);
  console.log('---');
  let endpoint;
  let caller;

  // if caller is a phone number, that is receiving an in-app call usecase
  if (req.query.from){
    endpoint = { type: "app", user: userLoggedIn };
    caller = req.query.from;
  }

  // if caller is an app user, that is making either an in-app call or app to app call 
  if (req.query.from_user){
    const regex = /^\d+$/; // Check to see if the to is all numerical digits which mean it is a phone number
    const isCalleePhoneNumber = regex.test(req.query.to);
    if (isCalleePhoneNumber) {
      caller = vonageNumber;
      endpoint =  { type: "phone", number: req.query.to };
    } else {
      caller = req.query.from_user;
      endpoint = { type: "app", user: req.query.to };
    }
  }

  console.log(`  - caller: ${caller}`);
  console.log(`  - callee: ${req.query.to}`);
  console.log('---');

  res.json([ 
    { 
      "action": "talk", 
      "text": "Please wait while we connect you."
    },
    { 
      "action": "connect",
      "from": caller,
      "endpoint": [ 
        endpoint
      ]
    }
  ]);
});
```

As your calls progress, Vonage will send events to notify your application to the "Event" webhook that was set during the setup process earlier (`// ⌄⌄⌄ Event Webhook ⌄⌄⌄`):
```js
app.all('/voice/event', (req, res) => {
  console.log('EVENT:');
  console.dir(req.body);
  console.log('---');
  res.sendStatus(200);
});
```
