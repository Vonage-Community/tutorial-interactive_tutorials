---
title: Run the Network Test
description: Check connectivity before measuring media quality.
---

# Run Connectivity and Quality Tests

The connectivity test checks access to the Video API services. The quality test then publishes test media to measure audio and video support, bitrate, packet loss, and recommended settings.

In `runPreCallTest()`, delete the `TODO` and the entire placeholder `return` block. Paste this code inside the existing function:

```js
const options = {
  timeout: 10000,
  audioSource,
  videoSource
};
const networkTest = new NetworkTest(OT, sessionInfo, options);
const connectivity = await networkTest.testConnectivity();

const blockingFailures = (connectivity.failedTests ?? [])
  .filter((test) => test.type !== "logging");
if (!connectivity.success && blockingFailures.length > 0) {
  return {
    connectivity,
    quality: null
  };
}

let quality;
try {
  quality = await networkTest.testQuality(onUpdate);
} catch (error) {
  if (error.name !== "UnsupportedBrowser") {
    throw error;
  }
  quality = null;
}

return {
  connectivity,
  quality
};
```

The test uses the camera and microphone selected in the waiting room. A logging-only failure does not prevent a call, so the quality test can continue; API, messaging, and media failures stop the flow. In Firefox, the waiting room can still use the connectivity result because `testQuality()` is not supported.

Save the file, wait for the restart, and reload the application.
