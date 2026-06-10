---
title: "Add archive buttons"
description: "Archiving"
---

# Add archive buttons

Replace `setupArchivingControls` with this snippet:

```js
export function setupArchivingControls({ elements, postJson, getSessionId, getLatestArchiveId, setLatestArchiveId }) {
  elements.startArchive.onclick = async () => {
    const archive = await postJson("/archive/start", { sessionId: getSessionId() });
    setLatestArchiveId(archive.id || archive.archiveId);
    elements.archiveStatus.textContent = `Archive started: ${getLatestArchiveId()}`;
    elements.startArchive.disabled = true;
    elements.stopArchive.disabled = false;
  };

  elements.stopArchive.onclick = async () => {
    const archiveId = getLatestArchiveId();
    const archive = await postJson(`/archive/${archiveId}/stop`, {});
    const stoppedId = archive.id || archive.archiveId || archiveId;
    elements.archiveStatus.textContent = `Archive stopped: ${stoppedId}`;
    elements.archiveLink.innerHTML = `<a href="/archive/${stoppedId}/view" target="_blank">View Archive</a>`;
    elements.startArchive.disabled = false;
    elements.stopArchive.disabled = true;
  };
}
```

Save the file.

> The UI stays intentionally plain. Frontend polish can come later; this exercise is about wiring the Video API flow.
