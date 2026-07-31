---
title: Run the Network Test
description: Check connectivity before measuring media quality.
---

Open `project/public/pre-call.js` and find `runPreCallTest()`.

The connectivity test checks access to the Video API services. If the required connectivity checks pass, the quality test uses the selected camera and microphone to measure media support, bitrate, packet loss, and recommended publish settings.

Replace:

```js
// TODO: runPreCallTest
```

with:

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

A logging-only failure does not block the call flow. Firefox can still use the connectivity result because `testQuality()` is not supported there.
