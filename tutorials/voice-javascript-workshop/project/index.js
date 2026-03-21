require('dotenv').config();
const express = require('express');
const path = require('path');

const cors = require('cors');

const app = express();
const port = 3000;

let userLoggedIn; // This gets set to the latest user that a token was generated for. In a production app, you'll want to use a database or something.


// ⌄⌄⌄ Vonage SDK library to generate tokens ⌄⌄⌄


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


// ⌄⌄⌄ Create an instance of the Vonage SDK and set your Vonage phone number ⌄⌄⌄


// Serve static files from the 'pages' directory
app.use(express.static(path.join(__dirname, 'pages')))

app.use(express.static('static'));
app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages/index.html'));
});


// ⌄⌄⌄ Function to create a User ⌄⌄⌄


// ⌄⌄⌄ Route to generate a token for the User ⌄⌄⌄


// ⌄⌄⌄ Answer Webhook ⌄⌄⌄


// ⌄⌄⌄ Event Webhook ⌄⌄⌄


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});