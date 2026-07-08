import { Vonage } from '@vonage/server-sdk';
import { flue, dispatch } from '@flue/runtime/routing';
import { Hono } from 'hono';
// import leonardoAgent from './agents/leonardo.ts';

const app = new Hono();

// ─── Vonage SDK Init ──────────────────────────────────────────────────────────

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

const vonageCredentials = {
  applicationId: appId,
  privateKey: privateKey
};
const vonage = new Vonage(vonageCredentials);


// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ ok: true }));

// ─── VONAGE: Answer URL (GET) ─────────────────────────────────────────────────
// Called by Vonage when the user's call is answered.
// Returns an NCCO that greets the caller and immediately begins listening.

app.get('/voice/answer', async (c) => {
  const callUUID = c.req.query('uuid') ?? '';
  const host = process.env.BASE_URL!;
// const host = 'supreme-space-telegram-j47jqq65gcpgrp-3000.app.github.dev';

  return c.json([
    {
      action: 'talk',
      text: `Buongiorno! I am Leonardo da Vinci. What curiosity brings you to speak with me today?`,
      language: 'en-US',
      style: 2,
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


// ─── VONAGE: Speech Result Webhook (POST) ─────────────────────────────────────
// Called by Vonage with the ASR transcript of what the user said.

app.post('/speech', async (c) => {
  const callUUID = c.req.query('uuid') ?? '';
  const body = await c.req.json();
  const host = process.env.BASE_URL!;
// const host = 'supreme-space-telegram-j47jqq65gcpgrp-3000.app.github.dev';

  const transcript: string =
    body?.speech?.results?.[0]?.text ??
    body?.speech?.results?.[0]?.transcript ??
    '';

  console.log(`[ASR] Call ${callUUID}: "${transcript}"`);

  let leonardoReply = '';

  if (!transcript.trim()) {
    leonardoReply = 'Forgive me, I did not hear you clearly. Could you speak again?';
  } else {
    try {
      const agentRes = await fetch(
        `https://${host}/agents/leonardo/${callUUID}?wait=result`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript }),
        }
      );
      const data = await agentRes.json() as any;
      leonardoReply =
        data?.result?.text ??
        data?.result ??
        data?.text ??
        data?.content ??
        '';

        console.log('[Leonardo Reply]', leonardoReply);

      if (!leonardoReply) {
        console.error('[Flue] Unexpected shape:', JSON.stringify(data));
        leonardoReply = 'My thoughts drift for a moment. Please ask again.';
      }
    } catch (err) {
      console.error('[Flue Agent Error]', err);
      leonardoReply = 'My mind wanders for a moment. Please, ask me again.';
    }
  }

  // Exactly the Vonage guide pattern — talk + input keeps the loop alive
  return c.json([
    {
      action: 'talk',
      text: leonardoReply,
      language: 'en-US',
      style: 2,
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

// ─── VONAGE: Event URL (POST) ─────────────────────────────────────────────────
app.post('/voice/event', async (c) => {
  const body = await c.req.json();
  console.log('[Vonage Event]', body.status, body.uuid);
  return c.body(null, 200);
});

// ─── Mount Flue routes at root ────────────────────────────────────────────────
// This makes Leonardo available at POST /agents/leonardo/:id
app.route('/', flue());

export default app;

async function getLeonardoResponse(streamUrl: string, offset: string): Promise<string> {
  const url = new URL(streamUrl);
  if (offset) url.searchParams.set('offset', offset);

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });

  if (!response.ok || !response.body) throw new Error(`SSE stream failed: ${response.status}`);

  let fullText = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // Processes one raw string — handles both 'data: {...}' and raw JSON
  const processChunk = (raw: string): boolean => {
    const trimmed = raw.trim();
    if (!trimmed) return false;

    const jsonStr = trimmed.startsWith('data:')
      ? trimmed.slice(trimmed.indexOf(':') + 1).trim()
      : trimmed;

    try {
      const parsed = JSON.parse(jsonStr);
      console.log("parsed: ", parsed);
      const events: any[] = Array.isArray(parsed) ? parsed : [parsed];

      for (const event of events) {
        // Keep this log on until you can see the text + completion event types
        console.log('[SSE type]', event.type, JSON.stringify(event).slice(0, 150));

        const chunk = event.text ?? event.content ?? event.delta?.text ?? '';
        if (chunk) fullText += chunk;

        if (['operation_end', 'agent_end', 'turn_end'].includes(event.type)) {
          const final = event.text ?? event.result?.text ?? event.output ?? '';
          if (final) fullText = final;
          return true; // signal completion
        }
      }
    } catch {
      // Incomplete JSON — not ready yet
    }
    return false;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: !done });

      // ── Path A: newline-delimited lines ──────────────────────────────
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) segment in buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (processChunk(line)) return fullText.trim();
      }

      // ── Path B: no newline — try parsing buffer directly each cycle ──
      // This handles Flue's no-trailing-newline format
      if (buffer.trim()) {
        if (processChunk(buffer)) {
          buffer = '';
          return fullText.trim();
        }
      }

      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }

  return fullText.trim();
}

// ─── Background: Call Flue Agent, then Transfer Call ─────────────────────────
async function processAndRespond(
  callUUID: string,
  speechBody: any,
  host: string,
  vonage: Vonage
) {
  // Extract the best ASR result
  const transcript: string =
    speechBody?.speech?.results?.[0]?.text ??
    speechBody?.speech?.results?.[0]?.transcript ??
    '';

  console.log(`[ASR] Call ${callUUID}: "${transcript}"`);

  let leonardoReply = '';

  if (!transcript || transcript.trim() === '') {
    leonardoReply =
      'Forgive me, I did not hear you clearly. Could you speak again?';
  } else {
    // Call the Flue Leonardo agent via its HTTP route.
    // Using the call UUID as the session ID preserves conversation memory
    // for the entire duration of this call.
        try {
      const agentRes = await fetch(
        `https://${host}/agents/leonardo/${callUUID}?wait=result`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript }),
        }
      );

      const data = await agentRes.json() as any;
      console.log('[Flue response]', JSON.stringify(data).slice(0, 200));

      // Adjust these field names to match what you see in the log above
      leonardoReply =
        data?.result?.text ??
        data?.result ??
        data?.text ??
        data?.content ??
        '';

        console.log('[Leonardo Reply]', leonardoReply);

      if (!leonardoReply) {
        console.error('[Flue] Unexpected response shape:', JSON.stringify(data));
        leonardoReply = 'My thoughts drift for a moment. Please ask again.';
      }
    } catch (err) {
      console.error('[Flue Agent Error]', err);
      leonardoReply = 'My mind wanders for a moment. Please, ask me again.';
    }
  }
  // Transfer the call with a new NCCO: speak Leonardo's reply, then listen again
  try {
    await vonage.voice.transferCallWithNCCO(callUUID, [
        {
            action: 'talk',
            text: leonardoReply,
            bargeIn: true,
            language: 'en-US',
            style: 2,
        },
        {
            action: 'input',
            type: ['speech'],
            speech: {
            language: 'en-US',
            endOnSilence: 2,
            startTimeout: 15,
            maxDuration: 30,
            },
            eventUrl: [`https://${host}/speech?uuid=${callUUID}`],
        },
    ]);
  } catch (err) {
    console.error('[Transfer Error]', err);
  }
}
