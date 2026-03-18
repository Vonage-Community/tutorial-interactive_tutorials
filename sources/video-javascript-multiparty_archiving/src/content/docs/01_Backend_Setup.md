---
title: Setup Backend
description: Let's get the server set up.
---

Let's start with the backend. The following code will be added to the `index.js` in the `routes` folder.

After importing some libraries and checking for some environment variables, import the Vonage SDKs needed and initialize instances with credentials:

```js
import { Vonage } from '@vonage/server-sdk';
import { Video } from '@vonage/video';

const vonageCredentials = {
  applicationId: appId,
  privateKey: privateKey
};
const vonage = new Vonage(vonageCredentials);
vonage.video = new Video(vonageCredentials);
```

Next, the routes related to Archiving will be added.

A `POST` request to `/archive/start` will create and start an archive with the session ID that is passed in. This route returns the archive object to the frontend.

```js
/**
 * POST /archive/start
 */
router.post('/archive/start', async function (req, res) {
  console.log('attempting to start archive');
  const json = req.body;
  const sessionId = json.sessionId;
  const archiveOptions = {
    name: findRoomFromSessionId(sessionId),
  };
  try {
    const archive = await vonage.video.startArchive(sessionId, archiveOptions);
    console.log("archive: ", archive);
    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  } catch (error){
    console.error("error starting archive: ",error);
    res.status(500).send({ error: 'startArchive error:' + error });
  }
});
```

To stop an archive, a `POST` request will be made to the `/archive/:archiveId/stop` where `:archiveId` is the ID of the archive that was started with the previous route. This endpoint return the archive object:

```js
/**
 * POST /archive/:archiveId/stop
 */
router.post('/archive/:archiveId/stop', async function (req, res) {
  const archiveId = req.params.archiveId;
  console.log('attempting to stop archive: ' + archiveId);
  try {
    const archive = await vonage.video.stopArchive(archiveId);
    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  } catch (error){
    console.error("error stopping archive: ",error);
    res.status(500).send({ error: 'stopArchive error:', error });
  }
});
```


Sending a `GET` request to `/archive/:archiveId/view` will return the URL of the recording of the archive that matches the ID (`archiveId`) if it is available, otherwise it will show a page that says 'Archiving Pending'.

```js
/**
 * GET /archive/:archiveId/view
 */
router.get('/archive/:archiveId/view', async function (req, res) {
  const archiveId = req.params.archiveId;
  console.log('attempting to view archive: ' + archiveId);
  try {
    const archive = await vonage.video.getArchive(archiveId);
    if (archive.status === 'available') {
      res.redirect(archive.url);
    } else {
      res.render('view', { title: 'Archiving Pending' });
    }
  } catch (error){
    console.log("error viewing archive: ",error);
    res.status(500).send({ error: 'viewArchive error:' + error });
  }
});
```

Send a `GET` request to `/archive/:archiveId` where `:archiveid` is the ID of the archive you'd like to get information for:

```js
/**
 * GET /archive/:archiveId
 */
router.get('/archive/:archiveId', async function (req, res) {
  const archiveId = req.params.archiveId;
  // fetch archive
  console.log('attempting to fetch archive: ' + archiveId);
  try {
    const archive = await vonage.video.getArchive(archiveId);
    // extract as a JSON object
    res.setHeader('Content-Type', 'application/json');
    res.send(archive);
  } catch (error){
    console.error("error getting archive: ",error);
    res.status(500).send({ error: 'getArchive error:' + error });
  }
});
```

To get a list of archives for the session returned to the frontend, send a `GET` request to `/archive` with the queries for `count`, `offset` and `sessionId`:

```js
/**
 * GET /archive
 */
router.get('/archive', async function (req, res) {
  let filter = {};
  if (req.query.count) {
    filter.count = req.query.count;
  }
  if (req.query.offset) {
    filter.offset = req.query.offset;
  }
  if (req.query.sessionId) {
    filter.sessionId = req.query.sessionId;
  }
  // list archives
  console.log('attempting to list archives');
  try {
    const archives = await vonage.video.searchArchives(filter);
    // extract as a JSON object
    res.setHeader('Content-Type', 'application/json');
    res.send(archives);
  } catch (error){
    console.error("error listing archives: ",error);
    res.status(500).send({ error: 'listArchives error:' + error });
  }
});
```
