const express = require('express');
const app = express();

app.use(express.json());

// TODO: Set up BASE_URL

app.get('/', (req, res) => {
  res.send("I'm listening!");
});

// TODO: Add the answer webhook

// TODO: Add the mainMenu function

// TODO: Add the DTMF webhook

// TODO: Add the event webhook

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
