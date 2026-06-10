---
title: "Validate setup in Learning Center"
description: "Workspace setup"
---

# Validate setup in Learning Center

You have finished the workspace setup in the Codespace.

**Copy this App URL** and paste it into the setup exercise in Learning Center.

<div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin: 1rem 0;">
  <label for="advanced-video-app-url"><strong>App URL</strong></label>
  <input id="advanced-video-app-url" type="text" readonly value="http://localhost:3000" style="flex: 1 1 24rem; min-width: 16rem; padding: 0.45rem 0.6rem; border: 1px solid var(--sl-color-gray-5); border-radius: 0.25rem; background: var(--sl-color-bg); color: var(--sl-color-text); font: inherit;" />
  <button id="advanced-video-copy-app-url" type="button" style="padding: 0.45rem 0.75rem; border: 1px solid var(--sl-color-text-accent); border-radius: 0.25rem; background: var(--sl-color-text-accent); color: var(--sl-color-text-invert); font: inherit; cursor: pointer;">Copy App URL</button>
</div>

<script>
(() => {
  const input = document.getElementById('advanced-video-app-url');
  const button = document.getElementById('advanced-video-copy-app-url');
  if (!input || !button) return;

  const getAppUrl = () => {
    if (window.location.protocol === 'file:') return 'http://localhost:3000';

    const url = new URL(window.location.href);
    url.pathname = '/';
    url.search = '';
    url.hash = '';

    if (url.hostname.endsWith('.app.github.dev')) {
      url.hostname = url.hostname.replace(/-\d+(?=\.app\.github\.dev$)/, '-3000');
      url.port = '';
      return url.origin;
    }

    url.port = '3000';
    return url.origin;
  };

  input.value = getAppUrl();

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      const originalLabel = button.textContent;
      button.textContent = 'Copied!';
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1200);
    } catch {
      input.focus();
      input.select();
    }
  });
})();
</script>

This URL uses the app and validation port `3000`. The guide itself runs on port `1234`.

Then validate the setup exercise there.
**Continue the tutorial** in Learning Center until it asks you to start the Debug timeline exercise.

Then return to this guide and press Next.

> Learning Center is still the source of completion. This guide only helps you do the work inside Codespaces.
