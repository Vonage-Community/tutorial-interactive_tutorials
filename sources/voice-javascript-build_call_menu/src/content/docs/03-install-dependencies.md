---
title: Install Dependencies
description: Install the Express dependency inside the project/ directory.
---

# Install Dependencies

`project/package.json` already lists `express` as a dependency, and Codespaces installs the project dependencies when it creates the workspace.

The terminal opens in the `project/` directory. Run the following command to make sure the dependencies are installed:

```sh
npm install
```

{% aside type="tip" %}
The `package.json` defines a `start` script that uses `node --watch index.js`. The Codespace starts this script automatically, so the server reloads whenever you save a change.
{% /aside %}

Once npm finishes, you are ready to add the Voice API logic.
