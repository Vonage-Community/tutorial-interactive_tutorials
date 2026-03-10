---
title: Add Styling
description: Let's add some style to the application
---

Time to style and layout the application.

Add these code snippets to the `app.css` file in the `css` folder.

Change the application's background color and center the elements:

```css
body, html {
  background-color: gray;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

We will have 2 columns (one for your video, the other for participants) side by side:

```css
#videos {
  position: relative;
  display: flex;
  align-items: center;
}
```

The section with your video and controls will have white border. The size of your video will be 360px x 240px. The button to publish your video will be hidden initially since your video will already be publishing to the call:

```css
#publisher-container {
  border: 3px solid white;
  border-radius: 3px;
  height: fit-content;
}
#publisher {
  width: 360px;
  height: 240px;
}
#publish-video-true {
  display: none;
}
```

