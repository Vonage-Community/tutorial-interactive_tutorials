---
title: Setup Backend
description: Let's get the server set up.
---

Let's start with the backend.

There is an `APPLICATION READY` link in the terminal below with a URL. Open that link in a new window.

> Note: If you see an error in the terminal, that is fine. The code you are about to add, will fix it.

The following code will be added to the `index.js` in the `routes` folder.


A `POST` request to `/archive/:archiveId/updateLayout` will update the layout of the current archive that is being recorded. First we use the session ID, stream ID, and class list to set the desired classes to streams. Then we use the archive ID to apply the layout type selected. The route then returns whether the archive layout was updated successfully or not. (`// ⌄⌄⌄ update Archive Layout ⌄⌄⌄
`):

```js
/**
 * POST /archive/:archiveId/updateLayout
 */
router.post('/archive/:archiveId/updateLayout', async function (req, res) {
  const archiveId = req.params.archiveId;
  const layout = req.body.layout;
  const streamId = req.body.streamId;
  const sessionId = req.body.sessionId;
  const classList = req.body.classList;
  console.log('attempting to update archive layout: ' + archiveId);
  try {
    await vonage.video.setStreamClassLists(sessionId, [{ id: streamId, layoutClassList: classList }])
    await vonage.video.updateArchiveLayout(archiveId, layout);
    res.status(200).send({ result: 'Successfully updated archive layout' });
  } catch (error) {
    console.error("error changing archive layout: ", error);
    res.status(500).send({ error: 'updating archive layout error:', error });
  }
});
```

