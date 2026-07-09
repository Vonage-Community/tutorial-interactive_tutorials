---
title: Set Up the Server URL
description: Build the Codespace public URL from environment variables.
---

# Set Up the Server URL

Your webhooks need to point back to this Codespace. GitHub Codespaces exposes the public hostname through two environment variables:

- `CODESPACE_NAME` — the unique name of your Codespace.
- `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN` — the domain used for port forwarding.

In `project/index.js`, find the comment:

```
// TODO: Set up BASE_URL
```

Replace it with:

```js
const BASE_URL = `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
```

`BASE_URL` will be used inside your NCCO to tell Vonage where to send DTMF keypresses.

{% aside %}
`BASE_URL` is constructed automatically — you do not need to hard-code any URLs.
{% /aside %}
