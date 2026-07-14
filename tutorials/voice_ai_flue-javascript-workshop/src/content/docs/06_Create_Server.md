---
title: Create a Server
description: Creating the server so we can interact with the Agent.
---

As mentioned previously, Vonage will bridge the communication between the phone call and our Agent through <a href="https://developer.vonage.com/en/voice/voice-api/webhook-reference" target="_blank">Webhooks</a>.

With the setup script that ran at the beginning of the workshop to create the Vonage application and purchase a number, it also set up the Webhook endpoints that we used.

Here, we will actually create the Webhook routes that the Vonage application is expecting.

Flue comes with a way to do this <a href="https://flueframework.com/docs/guide/routing" target="_blank">routing</a> right out of the box. By creating the optional `src/app.ts`, we can create the custom Webhook routes that Vonage needs by spinning up a <a href="https://hono.dev" target="_blank">Hono</a> server.

When Vonage sends a request, it is expecting a response that will tell it what to do with the call. These instructions are packaged in a <a href="https://developer.vonage.com/en/voice/voice-api/ncco-reference" target="_blank">Network Call Control Object (NCCO)</a>.

There are a lot of different actions that can be used during a call, but for this workshop, we will be using:

<a href="https://developer.vonage.com/en/voice/voice-api/ncco-reference#talk" target="_blank">Talk</a>: so that the Agent can speak.

<a href="https://developer.vonage.com/en/voice/voice-api/ncco-reference#input" target="_blank">Input</a>: so that we can process what the caller is saying.

The following code will be placed in the `src/app.ts` file.

When a call is answered, Vonage will make a request to this endpoint. The NCCO tells Vonage to say the Welcome message and then listen for what the caller says.

Find `// ⌄⌄⌄ Vonage Answer Webhook ⌄⌄⌄` and add this code:

```js
app.get('/voice/answer', async (c) => {
  const callUUID = c.req.query('uuid') ?? '';

  return c.json([
    {
      action: 'talk',
      text: agentWelcome,
      language: 'en-US',
      style: 22,
    },
    {
      action: 'input',
      type: ['speech'],
      eventUrl: [`https://${host}/speech?uuid=${callUUID}`],
      speech: {
        language: 'en-US',
        endOnSilence: 2,
        startTimeout: 15,
        maxDuration: 30,
      },
    },
  ]);
});

```

Once the caller is finished speaking, Vonage will do speech recognition and send the results as a request to the endpoint specified in `eventUrl` along with the Call's ID so the Agent can keep track of which response goes to which caller.

Here is the code for the `/speech` route that will take the speech recognition results and pass them to the Agent, get the Agent's response and then let Vonage know to say the Agent's response and then listen for what the caller says in the NCCO. This then creates a loop where the caller says something, the Agent responds and waits for the caller to say something again so that the Agent can respond again.

Find `// ⌄⌄⌄ /speech endpoint ⌄⌄⌄` and add this code:

```js
app.post('/speech', async (c) => {
  const callUUID = c.req.query('uuid') ?? '';
  const body = await c.req.json();

  const transcript: string =
    body?.speech?.results?.[0]?.text ?? '';

  console.log(`[ASR] Call ${callUUID}: "${transcript}"`);

  let agentReply = '';

  if (!transcript.trim()) {
    agentReply = 'Forgive me, I did not hear you clearly. Could you speak again?';
  } else {
    try {
      const agentRes = await fetch(
        `https://${host}/agents/${agent}/${callUUID}?wait=result`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript }),
        }
      );
      const data = await agentRes.json() as any;
      agentReply =
        data?.result?.text ??
        data?.result ??
        data?.text ??
        data?.content ??
        '';

        console.log(`[${agent} reply]`, agentReply);

      if (!agentReply) {
        console.error('[Flue] Unexpected shape:', JSON.stringify(data));
        agentReply = 'My thoughts drift for a moment. Please ask again.';
      }
    } catch (err) {
      console.error('[Flue Agent Error]', err);
      agentReply = 'My mind wanders for a moment. Please, ask me again.';
    }
  }

  // Exactly the Vonage guide pattern — talk + input keeps the loop alive
  return c.json([
    {
      action: 'talk',
      text: agentReply,
      language: 'en-US',
      style: 22,
    },
    {
      action: 'input',
      type: ['speech'],
      eventUrl: [`https://${host}/speech?uuid=${callUUID}`],
      speech: {
        language: 'en-US',
        endOnSilence: 2,
        startTimeout: 15,
        maxDuration: 30,
      },
    },
  ]);
});
```

> Note: `?wait=result` is added to let Flue know to wait until the Agent has created its reply to what the caller said.

To see all the events sent by Vonage during the call, we will set up an Event Webhook to log messages in the Terminal's console.

Find `// ⌄⌄⌄ Vonage Event Webhook ⌄⌄⌄` and add this code:
```js
app.post('/voice/event', async (c) => {
  const body = await c.req.json();
  console.log('[Vonage Event]', body.status, body.uuid);
  return c.body(null, 200);
});
```