---
title: Step Title Goes Here
description: Optional one-sentence description of this step.
---

<!-- 
  TUTORIAL STEP TEMPLATE
  ═══════════════════════
  This file is a template and reference example. Delete or replace it when
  writing real tutorial content.

  NAMING CONVENTION
  ─────────────────
  Files must follow the pattern:  NN-kebab-case-title.md
    NN  = zero-padded step number (01, 02, ... 10, 11 ...)
    Name = lowercase words joined by hyphens, no spaces or underscores
  
  Examples:
    01-welcome.md
    02-install-dependencies.md
    03-initialize-client.md
    04-send-message.md
    05-run-the-code.md
    06-whats-next.md

  CONVENTIONAL STEPS
  ──────────────────
  01-welcome.md      — Always first. Introduce the technology/API being used.
  NN-whats-next.md   — Always last. Link to further reading / Vonage developer portal.

  FRONTMATTER
  ───────────
  title:        (required) Short title shown in the sidebar navigation
  description:  (optional) Shown in meta tags and search; 1 sentence
-->

# Step Title Goes Here

<!--
  Start with a short introductory paragraph (1–3 sentences) that explains
  what the user will do in this step and why it matters.
-->

In this step, we will install the Vonage Node.js Server SDK, which provides
helper methods for all Vonage APIs.

<!--
  TERMINAL COMMANDS
  Use a fenced code block with "sh" or "bash" as the language.
-->

```sh
npm install @vonage/server-sdk
```

<!--
  CODE SNIPPETS
  Use the appropriate language identifier (js, ts, python, etc.).
  Include only the relevant snippet — not the entire file unless necessary.
-->

```js
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});
```

<!--
  ASIDES (callout boxes)
  Use {% aside %} for general notes, or add type="tip", type="caution", type="danger".
-->

{% aside type="tip" %}
The environment variables `VONAGE_API_KEY` and `VONAGE_API_SECRET` have been
pre-populated for you. You can view them in the `.env` file.
{% /aside %}

{% aside type="caution" %}
Never commit your API credentials to source control.
{% /aside %}

<!--
  FILE TREES
  Use {% filetree %} to show project structure. Indent with 2 spaces per level.
-->

{% filetree %}

- send-sms.js
- .env
- package.json

{% /filetree %}

<!--
  NUMBERED STEPS (within a page)
  Use {% steps %} / {% /steps %} around an ordered list for styled step numbers.
-->

{% steps %}

1. Open `send-sms.js` in the editor.

2. Paste the code from above into the file.

3. Save the file.

{% /steps %}

<!--
  TABS
  Use {% tabs %} with {% tabitem label="..." %} for language/platform variants.
-->

{% tabs %}
{% tabitem label="Node.js" %}
```js
console.log('Node.js example');
```
{% /tabitem %}
{% tabitem label="Python" %}
```python
print("Python example")
```
{% /tabitem %}
{% /tabs %}

<!--
  CLOSING NOTE (optional)
  Add 1–2 sentences summarising what was accomplished in this step.
-->

You have now installed the SDK and initialised the client with your credentials.
In the next step, you will write the code to send a message.
