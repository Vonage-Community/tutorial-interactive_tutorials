require('dotenv').config();

const express = require('express');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// TODO: Set up BASE_URL
// TODO: Set up OpenAI client

app.get('/', (req, res) => {
  res.send("I'm listening!");
});

// TODO: Add the answer webhook
// TODO: Add the ASR webhook
// TODO: Add the event webhook

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
