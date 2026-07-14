---
title: Change the Voice
description: Modify the Voice of Leonardo.
---

Vonage offers a few different <a href="https://developer.vonage.com/en/voice/voice-api/concepts/text-to-speech#voice-options" target="_blank">Voice Options</a> to choose from that have different price points. Take a look at the page and listen to some Voice samples.

So far, we have been using `Standard`. Before trying the other options, let's give Leonardo an Italian accent. To do this, we just need to change the `language` from `en-US` to `it-IT` and change the `style` to one from the table in the Vonage documentation (I like 6) in the `talk` actions in both the `/voice/answer` and `/speech` endpoints in the `src/app.ts` file.

After the changes, the `/voice/answer` endpoint's talk action should look like:
```js
{
  action: 'talk',
  text: agentWelcome,
  language: 'it-IT',
  style: 6,
},
```
and the `/speech` endpoint's talk action like this:
```js
{
  action: 'talk',
  text: agentReply,
  language: 'it-IT',
  style: 6,
},
```

Place another call and ask a question to a more historically accurate Leonardo da Vinci.

Now, let's try a `Premium` Voice. Again, you can reference the <a href="https://developer.vonage.com/en/voice/voice-api/concepts/text-to-speech?Language=Italian#supported-languages" target="_blank">Voice samples table</a> to listen to samples. Our previous `talk` action's `style` attribute of 6 has a premium version. To indicate that you want to use a Premium Voice, just add `premium: true` to your `talk` actions.

So, the `/voice/answer` endpoint's talk action will look like:
```js
{
  action: 'talk',
  text: agentWelcome,
  language: 'it-IT',
  style: 6,
  premium: true
},
```
and the `/speech` endpoint:
```js
{
  action: 'talk',
  text: agentReply,
  language: 'it-IT',
  style: 6,
  premium: true
},
```

Make another call. Notice the difference?

Vonage recently announced Premier Voices Beta that currently support Google's <a href="https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd" target="_blank">Chirp 3: HD Voices</a>.

To enable this in our application, we'll need to change the `talk` actions.

For the `/voice/answer` endpoint, it will now look like this:
```js
{
  action: 'talk',
  text: agentWelcome,
  provider: 'google',
  providerOptions: {
    name: 'it-IT-Chirp3-HD-Enceladus',
    language_code: 'it-IT'
  }
},
```
and the `/speech` endpoint:
```js
{
  action: 'talk',
  text: agentReply,
  provider: 'google',
  providerOptions: {
    name: 'it-IT-Chirp3-HD-Enceladus',
    language_code: 'it-IT'
  }
},
```

> Note: The `name` key follows this format:
`language-code`-Chirp3-HD-`voice-name`

Make another call to Leonardo. How does he sound?