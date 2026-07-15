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

<a href="https://developer.vonage.com/en/voice/voice-api/ncco-reference#stream" target="_blank">Stream</a>: to keep the call open, we'll play music while the AI Agent thinks of a response.

The following code will be placed in the `src/app.ts` file.

Since there will be many instances of `talk` and `input` actions, let's create some helper functions so that the code is much cleaner.

Find `// ⌄⌄⌄ Vonage NCCO Helper Functions ⌄⌄⌄` and add this code:

```js
const generateTalkAction = (text: String) => ({
  action: 'talk',
  text: text,
  language: 'en-US',
  style: 22,
});

const generateInputAction = (callUUID: String) => ({
  action: 'input',
  type: ['speech'],
  eventUrl: [`https://${host}/speech?uuid=${callUUID}`],
  speech: {
    language: 'en-US',
    endOnSilence: 2,
    startTimeout: 15,
    maxDuration: 30,
  },
});
```

When a call is answered, Vonage will make a request to this endpoint. The NCCO tells Vonage to say the Welcome message and then listen for what the caller says.

Find `// ⌄⌄⌄ Vonage Answer Webhook ⌄⌄⌄` and add this code:

```js
app.get('/voice/answer', async (c) => {
  const callUUID = c.req.query('uuid') ?? '';

  return c.json([
    generateTalkAction(agentWelcome),
    generateInputAction(callUUID)
  ]);

});
```

Once the caller is finished speaking, Vonage will do speech recognition and send the results as a request to the endpoint specified in `eventUrl` along with the Call's ID so the Agent can keep track of which response goes to which caller.

Here is the code for the `/speech` route that will take the speech recognition results and pass them to the Agent, get the Agent's response and then let Vonage know to say the Agent's response and then listen for what the caller says in the NCCO. This then creates a loop where the caller says something, the Agent responds and waits for the caller to say something again so that the Agent can respond again.

What happens if the Agent takes longer than the window Vonage has set to recieve a response from a Webhook endpoint to keep the call going and not hang up?

In this scenario, a 3 second timer is set and if the Agent has not responded by then, we quickly return a `talk` action saying 'Hmmmmm... Let me think about that.' and a `stream` action to keep the call going until the Agent has created a reply. Then we modify the ongoing call to send a `talk` action with the Agent's reply and an `input` action to listen for what the caller says.

We'll also take into consideration some other edge cases where errors can occur.

Find `// ⌄⌄⌄ /speech endpoint ⌄⌄⌄` and add this code:

```js
app.post('/speech', async (c) => {
  const callUUID = c.req.query('uuid') ?? '';
  const body = await c.req.json();

  const transcript: string = body?.speech?.results?.[0]?.text ?? '';

  console.log(`[ASR] Call ${callUUID}: "${transcript}"`);

  if (!transcript.trim()) {
    return c.json([
      generateTalkAction('Forgive me, I did not hear you clearly. Could you speak again?'),
      generateInputAction(callUUID)
    ]);
  }

  // 1. Inflight Agent Task
  const agentTask = (async () => {
    try {
      const agentRes = await fetch(
        `https://${host}/agents/${agent}/${callUUID}?wait=result`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript }),
        }
      );

      if (!agentRes.ok) {
        console.error(`[Flue API Error] HTTP ${agentRes.status}: ${agentRes.statusText}`);
        return 'I am having a little trouble thinking right now. Can you try again?';
      }

      const data = await agentRes.json() as any;
      let reply =
        data?.result?.text ??
        data?.result ??
        data?.text ??
        data?.content ??
        '';

      if (!reply) {
        console.error('[Flue] Empty response or unexpected shape:', JSON.stringify(data));
        return 'My thoughts drifted for a moment. What were we discussing?';
      }

      console.log(`[${agent} reply]`, reply);
      return reply;

    } catch (error) {
      console.error('[Network or Parsing Error]', error);
      return 'My connection seems unstable at the moment. Please ask me again.';
    }
  })();

  // 2. 3-Second Timeout
  const timeoutPromise = new Promise((resolve) =>
    setTimeout(() => resolve('TIMEOUT'), 3000)
  );

  // 3. Race Condition & Background Transfer
  try {
    const raceResult = await Promise.race([agentTask, timeoutPromise]);

    if (raceResult === 'TIMEOUT') {
      const backgroundTask = async () => {
        try {
          const delayedReply = await agentTask;

          await vonage.voice.transferCallWithNCCO(callUUID, [
            generateTalkAction(delayedReply),
            generateInputAction(callUUID)
          ]);
        } catch (bgError: any) {
          console.error('[Background Task Error]', bgError);
          if (bgError.response) {
            const errorBody = await bgError.response.json();
            console.error('Vonage API Error Details:', JSON.stringify(errorBody, null, 2));
          } else {
            console.error('Unknown Error:', bgError);
          }

          await vonage.voice.transferCallWithNCCO(callUUID, [
            generateTalkAction('I seem to have lost my train of thought. What were we discussing?'),
            generateInputAction(callUUID)
          ]);
        }
      };

      backgroundTask();
      console.log('Hmmmmm.....');

      return c.json([
        generateTalkAction('Hmmmmm... Let me think about that.'),
        {
          action: 'stream',
          streamUrl: [`https://${host}/public/Ink_on_Iron.mp3`],
          loop: 0
        }
      ]);

    } else {
      // AI responded within 3 seconds
      return c.json([
        generateTalkAction(raceResult as string),
        generateInputAction(callUUID)
      ]);
    }

  } catch (err) {
    console.error('[Route Error]', err);
    return c.json([
      generateTalkAction('An unexpected error occurred. Please try again.'),
      generateInputAction(callUUID)
    ]);
  }
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