---
title: Add Styling
description: Let's add some style to the application
---

Add this code snippet to the `app.css` file in the `css` folder to style the text chat (`/* ⌄⌄⌄ Add CSS for the text chat elements ⌄⌄⌄ */`):

```css
#textchat {
  position: relative;
  width: 20%;
  float: right;
  right: 0;
  height: 100%;
  background-color: #333;
}
#history {
  width: 100%;
  height: calc(100% - 40px);
  overflow: auto;
}
input#msgTxt {
  height: 40px;
  position: absolute;
  bottom: 0;
  width: 100%;
}
#history .mine {
  color: #00FF00;
  text-align: right;
  margin-right: 10px;
}
#history .theirs {
  color: #00FFFF;
  margin-left: 10px;
}
```
