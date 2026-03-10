---
title: Load Client Library
description: Add the Vonage Video Client Library
---

To connect your frontend application to the backend to be able to have a video call, the Vonage Video Client Library will need to be loaded.

Paste this code in the `index.html` file in the `head` section :

```js
<script src="https://video.standard.vonage.com/v2/js/opentok.min.js"></script>
```
> Note: We will be using a Content Delivery Network (CDN) to serve the library. As an alternative, you can also download the library and link to it in your application as well as a bundler like Vite to install it.