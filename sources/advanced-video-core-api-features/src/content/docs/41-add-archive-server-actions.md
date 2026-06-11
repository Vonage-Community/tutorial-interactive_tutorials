---
title: "Add archive server actions"
description: "Archiving"
---

Replace the archive functions with this snippet:

```js
export async function startArchive({ video, body, state }) {
  if (!video) throw new Error("missing_credentials");
  const archive = await video.startArchive(body.sessionId, { name: archiveNameForSession(body.sessionId) });
  state.latestArchive = {
    archiveId: archive.id,
    state: archive.status || "started",
    viewUrl: `/archive/${archive.id}/view`,
    updatedAt: new Date().toISOString()
  };
  return archive;
}

export async function stopArchive({ video, archiveId, state }) {
  if (!video) throw new Error("missing_credentials");
  const archive = await video.stopArchive(archiveId);
  state.latestArchive = {
    archiveId: archive.id || archiveId,
    state: archive.status || "stopped",
    viewUrl: `/archive/${archive.id || archiveId}/view`,
    updatedAt: new Date().toISOString()
  };
  return archive;
}

export async function getArchiveViewUrl({ video, archiveId, state }) {
  if (!video) throw new Error("missing_credentials");
  const archive = await video.getArchive(archiveId);
  state.latestArchive = {
    archiveId: archive.id || archiveId,
    state: archive.status || "available",
    viewUrl: `/archive/${archive.id || archiveId}/view`,
    updatedAt: new Date().toISOString()
  };
  return archive.status === "available" ? archive.url : null;
}
```

Save the file.

> This follows the archiving lesson: the server owns the archive start, stop, and view actions.
