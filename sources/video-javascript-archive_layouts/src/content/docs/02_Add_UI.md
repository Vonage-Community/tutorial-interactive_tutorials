---
title: Add UI
description: Add archive UI to the HTML.
---

This code will be added to the `index.html` file in the `public` folder (`<!-- ⌄⌄⌄ Add Archive Layout UI ⌄⌄⌄ -->`):

```html
<div id="layout-controls">
  <label for="layout-select">Choose an archive layout:</label>
  <select name="layouts" id="layout-select">
    <option value="bestFit">Best Fit (default)</option>
    <option value="pip">Picture-in-Picture</option>
    <option value="verticalPresentation">Vertical Presentation</option>
    <option value="horizontalPresentation">Horizontal Presentation</option>
    <option value="custom">Custom</option>
  </select>
  <br>
  <div>Current layout: <span id="current-layout">Best Fit</span></div>
</div>
```

- `layout-controls`: holds the UI to updating the archive layout
- `layout-select`: holds all the layout types
- `current-layout`: displays the current archive layout
