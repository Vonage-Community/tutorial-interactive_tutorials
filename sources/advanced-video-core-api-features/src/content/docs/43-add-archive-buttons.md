---
title: "Add archive buttons"
description: "Archiving"
---

Update `setupArchivingControls`:

```js
  elements.archiveStatus.dataset.archivingReady = "true";

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
```

Save the file.

> `setupArchivingControls` connects the app buttons to the archive routes and updates the page with the active archive ID and view link.
