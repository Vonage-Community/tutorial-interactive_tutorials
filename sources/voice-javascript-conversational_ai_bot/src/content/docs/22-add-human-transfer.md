---
title: Add Human Transfer
description: Replace the ASR webhook so it can return a connect NCCO.
---

# Add Human Transfer

The ASR webhook now passes the `tools` array to OpenAI. If the model calls `connect_to_human`, your server returns a Vonage `connect` action instead of another bot response.

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
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: history,
      tools,
    });

    const message = response.choices[0].message;

    if (message.tool_calls?.[0]?.function?.name === 'connect_to_human') {
      if (!VONAGE_NUMBER || !HUMAN_AGENT_NUMBER) {
        console.error('Set VONAGE_NUMBER and HUMAN_AGENT_NUMBER in project/.env.');
        return res.json(getConversationalNCCO('Transfer is not configured yet. Please try again later.'));
      }

      console.log(`Transferring call ${uuid} to a human agent.`);
      sessions.delete(uuid);

      return res.json([
        {
          action: 'talk',
          text: 'Please hold while I connect you to a human representative.'
        },
        {
          action: 'connect',
          from: VONAGE_NUMBER,
          endpoint: [{ type: 'phone', number: HUMAN_AGENT_NUMBER }]
        }
      ]);
    }

    const aiResponse = message.content || 'I can help with that.';
    history.push({ role: 'assistant', content: aiResponse });
    sessions.set(uuid, history);

    res.json(getConversationalNCCO(aiResponse));
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.json(getConversationalNCCO('I encountered an error. Please try again.'));
  }
});
```

Save `project/index.js`. The server reloads automatically and reads the transfer numbers from `.env`.
