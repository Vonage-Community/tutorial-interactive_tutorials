import { flue } from '@flue/runtime/routing';
import { Hono } from 'hono';

const app = new Hono();
const host = process.env.BASE_URL!;

const agent = "leonardo";
const agentWelcome = "Buongiorno! I am Leonardo da Vinci. What curiosity brings you to speak with me today?";


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

