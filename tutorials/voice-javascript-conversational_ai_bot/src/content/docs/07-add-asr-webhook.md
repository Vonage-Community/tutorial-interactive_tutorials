---
title: Add ASR Webhook
description: Send the caller's speech transcription to OpenAI and return a spoken answer.
---

# Add ASR Webhook

After the caller stops speaking, Vonage sends the speech result to your ASR webhook. Your server reads the transcription, asks OpenAI for a short answer, and returns a new NCCO for Text-to-Speech.

In `project/index.js`, find:

```js
// TODO: Add the ASR webhook
```

Replace it with:

```js
app.post('/webhooks/asr', async (req, res) => {
  const speechResults = req.body.speech?.results;
  console.log(req.body);

  if (!speechResults || speechResults.length === 0) {
    return res.json([
      { action: 'talk', text: "I'm sorry, I didn't catch that. Goodbye." }
    ]);
  }

  const userText = speechResults[0].text;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant on a phone call. Keep answers concise.'
        },
        { role: 'user', content: userText }
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    res.json([{ action: 'talk', text: aiResponse }]);
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.json([
      { action: 'talk', text: 'I encountered an error processing your request.' }
    ]);
  }
});
```

At this stage, each caller question is handled independently. Conversation memory is added later in the exercise.
