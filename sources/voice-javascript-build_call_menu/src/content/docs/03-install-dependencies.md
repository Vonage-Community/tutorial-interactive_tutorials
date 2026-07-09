---
title: Install Dependencies
description: Install the Express dependency inside the project/ directory.
---

# Install Dependencies

`project/package.json` already lists `express` as a dependency. You just need to install it.

Open the terminal and run:

```sh
cd project && npm install
```

{% aside type="tip" %}
The `package.json` also defines a `start` script that runs `node --watch index.js`, so the server will automatically reload whenever you save a change.
{% /aside %}

Once npm finishes, you are ready to start adding code.
