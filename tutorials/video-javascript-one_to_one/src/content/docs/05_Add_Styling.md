---
title: Add Styling
description: Let's add some style to the application
---

Time to style and layout the application.

Add these code snippets to the `app.css` file in the `css` folder.

Change the application's background color and set the height to 100%:

```css
body, html {
  background-color: gray;
  height: 100%;
}
```

Your video (publisher) will be in the lower left corner of the page and have a white border. The size of your video will be 360px x 240px. It will also be on top of the subscriber's video:

```css
#publisher {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 100;
  border: 3px solid white;
  border-radius: 3px;
  height: fit-content;
  width: 360px;
  height: 240px;
}
```

The other video call partcipant (subscriber) will have their video sized to the whole page:

```css
#subscriber {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
}
```