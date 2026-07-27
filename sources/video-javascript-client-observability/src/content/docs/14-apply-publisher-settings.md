---
title: Apply Publisher Settings
description: Use the quality test recommendation when initializing the Publisher.
---

# Apply Recommended Publisher Settings

The quality test recommends a resolution and frame rate that match the measured connection. The prepared application combines these values with the selected camera and microphone when it initializes the Publisher.

In `getRecommendedPublisherOptions()`, delete the `TODO` and `return {};`. Paste this code inside the existing function:

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

The audio-only fallback is returned for applications that choose to support it. This exercise still reports `Fail` when video is unavailable because its prepared call requires both media types.

Save the file, wait for the restart, and reload the application. All seven implementation checks should now be complete.
