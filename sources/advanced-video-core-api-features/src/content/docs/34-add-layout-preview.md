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

> This mirrors the recording layout idea from the lesson without forcing you to wait for a playable archive.
