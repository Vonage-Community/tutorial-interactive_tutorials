---
title: "Add layout preview"
description: "Recording layout"
---

Replace `getRecordingLayoutPreview` with this snippet:

```js
export function getRecordingLayoutPreview({ focusTarget }) {
  return {
    layout: "horizontalPresentation",
    streamClass: "focus",
    focused: Boolean(focusTarget),
    previewUrl: "/app/"
  };
}
```

Save the file.

> This mirrors the recording layout idea from the lesson without forcing you to wait for a playable archive.
