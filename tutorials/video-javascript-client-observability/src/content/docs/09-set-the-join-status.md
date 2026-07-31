---
title: Set the Join Status
description: Map connectivity, support, bitrate, packet loss, and publish recommendations to a waiting-room decision.
---

In `project/public/pre-call.js`, find `getPreCallStatus()`.

This function turns the pre-call test result into the waiting-room decision. The sample allows the user to join on `Pass` or `Warn`, but keeps the join button disabled on `Fail`.

Replace:

```js
// TODO: getPreCallStatus
```

with:

```js
const failedTypes = (connectivity?.failedTests ?? [])
  .map((test) => test.type);
const blockingFailure = failedTypes.find((type) => type !== "logging");
if (blockingFailure) {
  return {
    status: "Fail",
    reason: `The ${blockingFailure} connectivity check failed.`
  };
}

if (!quality) {
  return {
    status: "Warn",
    reason: "Connectivity passed, but the quality test is not available."
  };
}

if (!quality.audio?.supported || !quality.video?.supported) {
  return {
    status: "Fail",
    reason: "This call requires supported audio and video."
  };
}

const packetLoss = [
  quality.audio.packetLossRatio,
  quality.video.packetLossRatio
];
const criticalPacketLoss = packetLoss
  .some((value) => Number.isFinite(value) && value > 0.05);
const criticalBitrate =
  quality.audio.bitrate < 25000 ||
  quality.video.bitrate < 150000;
if (criticalPacketLoss || criticalBitrate) {
  return {
    status: "Fail",
    reason: "Packet loss or bitrate does not meet the requirements for this call."
  };
}

const warningPacketLoss = packetLoss
  .some((value) => Number.isFinite(value) && value >= 0.03);
const incompleteMeasurements = [
  quality.audio.bitrate,
  quality.video.bitrate,
  ...packetLoss
].some((value) => !Number.isFinite(value));
const [recommendedWidth, recommendedHeight] = String(
  quality.video.recommendedResolution ?? ""
).split("x").map(Number);
const recommendedFrameRate = quality.video.recommendedFrameRate;
const reducedRecommendation =
  !Number.isFinite(recommendedWidth) ||
  !Number.isFinite(recommendedHeight) ||
  !Number.isFinite(recommendedFrameRate) ||
  recommendedWidth < 640 ||
  recommendedHeight < 480 ||
  recommendedFrameRate < 15;
const qualityLimitation = quality.video.qualityLimitationReason;

if (
  failedTypes.includes("logging") ||
  warningPacketLoss ||
  incompleteMeasurements ||
  reducedRecommendation ||
  qualityLimitation === "bandwidth" ||
  qualityLimitation === "cpu"
) {
  return {
    status: "Warn",
    reason: "The call can continue, but the waiting room should show a quality warning."
  };
}

return {
  status: "Pass",
  reason: "Connectivity and media quality are ready for the call."
};
```

Save the file and reload the application.
