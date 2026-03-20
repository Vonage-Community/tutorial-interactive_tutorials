import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import _ from 'lodash';
import fs from 'fs';
import { tokenGenerate } from '@vonage/jwt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const appId = process.env.API_APPLICATION_ID;
let privateKey;

if (process.env.PRIVATE_KEY) {
  try {
      privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8');
  } catch (error) {
      // PRIVATE_KEY entered as a single line string
      privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
  }
} else if (process.env.PRIVATE_KEY64){
  privateKey = Buffer.from(process.env.PRIVATE_KEY64, 'base64');
}

if (!appId || !privateKey) {
  console.error('=========================================================================================================');
  console.error('');
  console.error('Missing Vonage Application ID and/or Vonage Private key');
  console.error('Find the appropriate values for these by logging into your Vonage Dashboard at: https://dashboard.nexmo.com/applications');
  console.error('Then add them to ', path.resolve('.env'), 'or as environment variables' );
  console.error('');
  console.error('=========================================================================================================');
  process.exit();
}

import { Vonage } from '@vonage/server-sdk';
import { Video } from '@vonage/video';

const vonageCredentials = {
  applicationId: appId,
  privateKey: privateKey
};
const vonage = new Vonage(vonageCredentials);
vonage.video = new Video(vonageCredentials);

// IMPORTANT: roomToSessionIdDictionary is a variable that associates room names with unique
// session IDs. However, since this is stored in memory, restarting your server will
// reset these values if you want to have a room-to-session association in your production
// application you should consider a more persistent storage

let roomToSessionIdDictionary = {};

// returns the room name, given a session ID that was associated with it
function findRoomFromSessionId(sessionId) {
  return _.findKey(roomToSessionIdDictionary, function (value) { return value === sessionId; });
}

// Creates a session with various roles and properties
async function createSession(response, roomName, sessionProperties = {}, role = 'moderator') {
  let sessionId;
  let token;
  console.log(`Creating ${role} creds for ${roomName}`);

  if (roomToSessionIdDictionary[roomName]) {
    sessionId = roomToSessionIdDictionary[roomName];
    token = vonage.video.generateClientToken(sessionId, { role })
    response.setHeader('Content-Type', 'application/json');
    response.send({
      applicationId: appId,
      sessionId: sessionId,
      token: token
    });
  } else {
    try {
      const session = await vonage.video.createSession(sessionProperties);

      // now that the room name has a session associated wit it, store it in memory
      // IMPORTANT: Because this is stored in memory, restarting your server will reset these values
      // if you want to store a room-to-session association in your production application
      // you should use a more persistent storage for them
      roomToSessionIdDictionary[roomName] = session.sessionId;

      // generate token
      token = vonage.video.generateClientToken(session.sessionId, { role });
      response.setHeader('Content-Type', 'application/json');
      response.send({
        applicationId: appId,
        sessionId: session.sessionId,
        token: token
      });
    } catch(error) {
      console.error("Error creating session: ", error);
      response.status(500).send({ error: 'createSession error:' + error });
    }
  }
}

router.use(express.static(path.join(__dirname, '../public')));

router.get('/routes', function (req, res) {
  res.render('index', { title: 'Learning-Vonage-Node' });
});

/**
 * GET /session redirects to /room/session
 */
router.get('/session', function (req, res) {
  res.redirect('/room/session');
});

/**
 * GET /room/:name
 */
router.get('/room/:name', async function (req, res) {
  const roomName = req.params.name;
  const e2ee = req.params.e2ee || false
  await createSession(res, roomName, { mediaMode:"routed", e2ee }, 'moderator');
});

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

/**
 * GET /api/config
 */
 router.get('/api/config', (req, res) => {
  res.json({
    applicationId: process.env.API_APPLICATION_ID
  });
});

/**
 * GET /
 */
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

/**
 * POST /graphql
 */
router.post('/graphql', async (req, res) => {
  try {
    const token = tokenGenerate(appId, privateKey);
    const graphqlResponse = await fetch('https://tools.vonage.com/video/insights-api/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    })
    const graphqlResponseJson = await graphqlResponse.json();
    res.send(graphqlResponseJson);
  } catch (error) {
    console.error("Error with GraphQL: ", error);
    res.status(500).send(`Error with GraphQL: ${error}`);
  }
});

// Serve the GraphiQL interface on the graphiql route
router.get('/graphiql', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'graphiql.html'));
});

export default router;
