# Vonage Interactive Tutorial — Authoring Instructions

You are helping author a **Vonage interactive tutorial** built with Astro, Starlight, and Markdoc.
These instructions apply to all AI-assisted edits in this project.

---

## Project Structure

```
tutorials/<tutorial-name>/
├── src/
│   └── content/
│       └── docs/           ← ALL tutorial step files go here
│           ├── index.mdx   ← Landing page (title/tagline only — do not edit content)
│           ├── 01-welcome.md
│           ├── 02-...md
│           └── NN-whats-next.md
├── astro.config.mjs        ← Do not modify
├── markdoc.config.mjs      ← Do not modify
├── package.json            ← Do not modify
└── tutorial-config.json    ← Do not modify manually
```

**Only edit files inside `src/content/docs/`.** Do not touch config files, `index.mdx` content,
or any file outside `src/` unless explicitly asked.

---

## File Naming Convention

All step files must follow this pattern:

```
NN-kebab-case-title.md
```

- `NN` = zero-padded two-digit step number: `01`, `02`, `03` ... `10`, `11`
- Name = lowercase words separated by hyphens, no spaces, no underscores
- Extension: always `.md`

### Examples
```
01-welcome.md
02-install-dependencies.md
03-initialize-client.md
04-send-the-message.md
05-run-the-code.md
06-whats-next.md
```

---

## Conventional First and Last Steps

**First step — always `01-welcome.md`**
Introduce the technology or API being used. Cover what it is, what it can do,
and what the user will build by the end of the tutorial.

**Last step — always `NN-whats-next.md`**
Point the user to further reading. Always include a link to the
[Vonage Developer Portal](https://developer.vonage.com).

---

## Frontmatter

Every step file starts with YAML frontmatter:

```yaml
---
title: Short Step Title    # required — appears in the sidebar
description: One sentence. # optional — shown in meta/search
---
```

- `title` is required and should be short (3–6 words)
- `description` is optional; use it for the first step and the last step

---

## Content Guidelines

- One concept per step. Keep steps short and focused.
- Start each step with 1–3 sentences explaining what the user will do and why.
- Use an H1 heading (`#`) that matches or elaborates on the `title`.
- Use fenced code blocks for all code and terminal commands (with language identifier).
- End each step (except the last) with 1–2 sentences summarising what was accomplished.

---

## Available Markdoc Components

This project uses Markdoc (`.md` files, not `.mdx`). Use these components:

### Asides (callout boxes)

```
{% aside %}
General note or information.
{% /aside %}

{% aside type="tip" %}
Helpful tip or shortcut.
{% /aside %}

{% aside type="caution" %}
Warning — something to be careful about.
{% /aside %}

{% aside type="danger" %}
Critical warning — data loss, security risk, etc.
{% /aside %}
```

### File Trees

```
{% filetree %}

- package.json
- src/
  - index.js
  - utils/
    - helpers.js

{% /filetree %}
```

### Numbered Steps (within a page)

```
{% steps %}

1. First action.

2. Second action.

3. Third action.

{% /steps %}
```

### Tabs

```
{% tabs %}
{% tabitem label="Node.js" %}
Node.js-specific content here.
{% /tabitem %}
{% tabitem label="Python" %}
Python-specific content here.
{% /tabitem %}
{% /tabs %}
```

---

## Code Blocks

Use standard fenced markdown with a language identifier:

````
```sh
npm install @vonage/server-sdk
```

```js
const vonage = new Vonage({ apiKey: '...', apiSecret: '...' });
```

```python
client = vonage.Client(key="...", secret="...")
```
````

---

## Reference

`src/content/docs/02-step-template.md` is a complete annotated example of a well-formed
tutorial step. Use it as a structural reference when generating new steps.
