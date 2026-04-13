---
title: Add Client SDK
description: Add Vonage Client SDK to index.html 
---

We'll be creating a WebXR application using <a href="https://xrblocks.github.io" target="_blank">XR Blocks</a> that can answer phone calls.

The following code will be placed in the `index.html` file.

First, we will need to load the Vonage Client SDK from a CDN (`<!-- ⌄⌄⌄ Load the Vonage Client SDK ⌄⌄⌄ -->`):
```html
<script src="https://cdn.jsdelivr.net/npm/@vonage/client-sdk@latest/dist/vonageClientSDK.min.js"></script>
```

> Note: You can also install the Client SDK and point to the nodes module folder if you are using a bundler.

## That's it for the HTML!

Everything else will be handled by XR Blocks.