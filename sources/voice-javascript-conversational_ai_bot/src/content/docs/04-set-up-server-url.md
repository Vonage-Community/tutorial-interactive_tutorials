---
title: Set Up Server URL
description: Build the public Codespace URL used by Voice API webhooks.
---

# Set Up Server URL

Your webhooks need to point back to this Codespace. GitHub Codespaces exposes the public hostname through environment variables.

In `project/index.js`, find:

```js
// TODO: Set up BASE_URL
```

Replace it with:

```js
const BASE_URL = `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
```

`BASE_URL` is used in the NCCO so Vonage knows where to send the speech input callback. You do not need to hard-code a Codespace URL in your source file.
