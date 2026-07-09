---
title: "Add layout preview"
description: "Recording layout"
---

Update `getRecordingLayoutPreview`:

```js
  return {
    layout: "horizontalPresentation",
    streamClass: "focus",
    focused: Boolean(focusTarget),
    previewUrl: "/app/"
  };
```

Save the file.

> `getRecordingLayoutPreview` returns the layout name, focused stream class, and preview URL that the app stores before you test archiving.
