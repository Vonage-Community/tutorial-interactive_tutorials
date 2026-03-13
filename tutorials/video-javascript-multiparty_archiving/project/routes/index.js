import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import _ from 'lodash';
import fs from 'fs';

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





// ⌄⌄⌄ import SDKs and initialize instances ⌄⌄⌄









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




// ⌄⌄⌄ start an Archive ⌄⌄⌄





// ⌄⌄⌄ stop an Archive ⌄⌄⌄







// ⌄⌄⌄ view an Archive recording ⌄⌄⌄






// ⌄⌄⌄ get info on an Archive ⌄⌄⌄







// ⌄⌄⌄ get a list of Archives ⌄⌄⌄



export default router;