---
title: "Add publisher profiles"
description: "Publisher tuning"
---

Replace the publisher tuning functions with this snippet:

```js
const profiles = {
  Balanced: {
    width: "100%",
    height: "100%",
    resolution: "640x480",
    frameRate: 30,
    maxBitrate: 600000
  },
  "Low Bandwidth": {
    width: "100%",
    height: "100%",
    resolution: "320x240",
    frameRate: 15,
    maxBitrate: 150000
  }
};

export function getPublisherProfiles() {
  return profiles;
}

export function getPublisherOptions(profileName) {
  const profile = profiles[profileName] || profiles.Balanced;
  return {
    insertMode: "append",
    width: profile.width,
    height: profile.height,
    resolution: profile.resolution,
    frameRate: profile.frameRate,
    maxBitrate: profile.maxBitrate
  };
}

export async function recordPublisherProfile(profileName, postJson) {
  const profile = profiles[profileName] || profiles.Balanced;
  await postJson("/api/diagnostics/publisher", {
    profile: profileName,
    applied: true,
    settings: profile
  });
}
```

Save the file.

> This keeps the exercise focused on choosing and applying simple publisher settings, not on building a full settings panel.
