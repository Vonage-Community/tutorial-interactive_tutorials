---
title: Add UI
description: The HTML structure of the application
---

Now let's add some structure to your video application.

Copy this HTML code in the `body` section of `index.html`:

```HTML
<div id="videos">
    <div id="publisher-container">
        <div id="publisher"></div>
        <div id="publisher-controls">
            <button id="publish-video-true">publishVideo true</button>
            <button id="publish-video-false">publishVideo false</button>
        </div>
    </div>
    <div id="subscribers"></div>
</div>
```

- `videos` is the container element of the video application
- `publisher` is where your camera's video will show up
- `publisher-controls` will hold the buttons that will turn your video feed off and on
- `subscribers` is where all the other video participants will appear

