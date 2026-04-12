require('dotenv').config();
const express = require('express');
const path = require('path');

const cors = require('cors');

const app = express();
const port = 3000;

let userLoggedIn; // This gets set to the latest user that a token was generated for. In a production app, you'll want to use a database or something.

const { tokenGenerate } = require('@vonage/jwt')

const fs = require('fs');

const appId = process.env.API_APPLICATION_ID;
let privateKey;

if (process.env.PRIVATE_KEY) {
  try {
      privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8');
  } catch (error) {
      // PRIVATE_KEY entered as a single line string
      privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
  }
} else if (process.env.PRIVATE_KEY64){
  privateKey = Buffer.from(process.env.PRIVATE_KEY64, 'base64');
}

if (!appId || !privateKey) {
  console.error('=========================================================================================================');
  console.error('');
  console.error('Missing Vonage Application ID and/or Vonage Private key');
  console.error('Find the appropriate values for these by logging into your Vonage Dashboard at: https://dashboard.nexmo.com/applications');
  console.error('Then add them to ', path.resolve('.env'), 'or as environment variables' );
  console.error('');
  console.error('=========================================================================================================');
  process.exit();
}

const { Vonage } = require('@vonage/server-sdk');
const vonageCredentials = {
  applicationId: appId,
  privateKey: privateKey
};
const vonage = new Vonage(vonageCredentials);

const vonageNumber = process.env.VONAGE_PHONE_NUMBER;

// Serve static files from the 'pages' directory
app.use(express.static(path.join(__dirname, 'pages')))

app.use(express.static('static'));
app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages/index.html'));
});

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


app.all('/voice/event', (req, res) => {
  console.log('EVENT:');
  console.dir(req.body);
  console.log('---');
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
