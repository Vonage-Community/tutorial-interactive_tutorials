---
title: Add Styling
description: Let's add some style to the application
---

Time to style and layout the application.

Add these code snippets to the `app.css` file in the `css` folder.

Change the application's background color and center the elements `/* style body and html */`:

```css
body, html {
  background-color: gray;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

For the layout of the participants in the call, we will use CSS Grid to place and size the video streams based on the number of callers `/* style participants container */`:

```css
#participants {
  margin: auto;
  width: 75vw;
  display: grid;
  height: 75vh;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

We will position the controls to the bottom left of the screen. The button to publish your video will be hidden initially since your video will already be publishing to the call `/* hide publish video button and position controls */`:

```css
#publish-video-true {
  display: none;
}

#publisher-controls {
  position: absolute;
  display: flex;
  bottom: 10px;
  left: 10px;
}
```
