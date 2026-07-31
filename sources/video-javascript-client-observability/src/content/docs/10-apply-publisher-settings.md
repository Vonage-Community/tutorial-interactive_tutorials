---
title: Apply Publisher Settings
description: Use the quality test recommendation when initializing the Publisher.
---

In `project/public/pre-call.js`, find `getRecommendedPublisherOptions()`.

The quality test can recommend a resolution and frame rate for the measured connection. The application passes these values into `OT.initPublisher()` when the user joins the call.

Replace:

```js
// TODO: getRecommendedPublisherOptions
```

with:

```js
const options = {};

if (quality?.video?.supported) {
  options.resolution = quality.video.recommendedResolution;
  options.frameRate = quality.video.recommendedFrameRate;
} else if (quality?.video) {
  options.videoSource = null;
}

if (quality?.audio && !quality.audio.supported) {
  options.audioSource = null;
}

return options;
```

Save the file and reload the application. The implementation checks should now be complete.
