---
title: Add UI
description: The HTML structure of the application
---

Now let's add some structure to your video application.

Copy this HTML code in the `body` section of `index.html` `<!-- ⌄⌄⌄ Add UI ⌄⌄⌄ -->`:

```html
<div id="participants"></div>
<div id="publisher-controls">
    <button id="publish-video-true">publishVideo true</button>
    <button id="publish-video-false">publishVideo false</button>
</div>
```

- `participants` is where all the video feeds from all participants in the call (including your own)
- `publisher-controls` will hold the buttons that will turn your video feed off and on
