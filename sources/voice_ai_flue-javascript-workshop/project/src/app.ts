import { flue } from '@flue/runtime/routing';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'node:fs';
import { Vonage } from '@vonage/server-sdk';

// Vonage setup
const appId = process.env.API_APPLICATION_ID;
let privateKey;

if (process.env.PRIVATE_KEY) {
  try {
    privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8');
  } catch (error) {
    // PRIVATE_KEY entered as a single line string
    privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
  }
} else if (process.env.PRIVATE_KEY64) {
  privateKey = Buffer.from(process.env.PRIVATE_KEY64, 'base64');
}

const vonageCredentials = {
  applicationId: appId,
  privateKey: privateKey
};
const vonage = new Vonage(vonageCredentials);

const app = new Hono();
const host = process.env.BASE_URL!;

const agent = "leonardo";
const agentWelcome = "Buongiorno! I am Leonardo da Vinci. What curiosity brings you to speak with me today?";

app.use('/public/*', serveStatic({ root: './' }));

// ⌄⌄⌄ Vonage NCCO Helper Functions ⌄⌄⌄

// ─── VONAGE: Answer URL (GET) ─────────────────────────────────────────────────
// Called by Vonage when the user's call is answered.
// Returns an NCCO that greets the caller and immediately begins listening.

// ⌄⌄⌄ Vonage Answer Webhook ⌄⌄⌄



// ─── VONAGE: Speech Result Webhook (POST) ─────────────────────────────────────
// Called by Vonage with the ASR transcript of what the user said.

// ⌄⌄⌄ /speech endpoint ⌄⌄⌄


// ─── VONAGE: Event URL (POST) ─────────────────────────────────────────────────

// ⌄⌄⌄ Vonage Event Webhook ⌄⌄⌄


// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ ok: true }));


// ─── Mount Flue routes at root ────────────────────────────────────────────────
// This makes Agents available at POST /agents/{agent}/:id
app.route('/', flue());


export default app;

