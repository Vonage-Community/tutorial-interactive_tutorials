---
title: Replace ASR Webhook
description: Send the full conversation history to OpenAI on every turn.
---

# Replace ASR Webhook

The ASR webhook now reads from the caller's history, appends the latest question, and stores the assistant response before listening again.

Replace the existing `app.post('/webhooks/asr', ...)` handler with:

```js
app.post('/webhooks/asr', async (req, res) => {
  const { uuid, speech } = req.body;
  const userText = speech?.results?.[0]?.text;
  console.log(req.body);

  if (!userText) {
    sessions.delete(uuid);
    return res.json([{ action: 'talk', text: 'Goodbye!' }]);
  }

  const history = sessions.get(uuid) || getInitialHistory();
  history.push({ role: 'user', content: userText });

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: history,
    });

    const aiResponse = completion.choices[0].message.content;
    history.push({ role: 'assistant', content: aiResponse });
    sessions.set(uuid, history);

    res.json(getConversationalNCCO(aiResponse));
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.json(getConversationalNCCO('I encountered an error. Please try again.'));
  }
});
```

Because the full `history` array is sent on each turn, the bot can answer follow-up questions in context.
