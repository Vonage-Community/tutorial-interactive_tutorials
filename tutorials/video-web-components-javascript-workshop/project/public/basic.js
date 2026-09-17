// Get a reference to the video-publisher element

const audioToggle = document.querySelector('#audio-toggle');
const videoToggle = document.querySelector('#video-toggle');

// Get a reference to the video-subscribers element


// Set server URL
let serverURL;
let applicationId = 'YOUR_APPLICATION_ID';
let sessionId = 'YOUR_SESSION_ID';
let token = 'YOUR_TOKEN';

function initializeSession() {
  const session = OT.initSession(applicationId, sessionId);
  // Set session and token (and optionally properties) for video-publisher

  // Add toggling audio and video functionality

  // Set session and token for video-subscribers

}

if (serverURL) {
  const fetchCredentials = async () => {
    try {
      const response = await fetch(serverURL + '/session');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const credentials = await response.json();
      applicationId = credentials.applicationId;
      sessionId = credentials.sessionId;
      token = credentials.token;
      initializeSession();
    } catch (err) {
      console.error('Error getting credentials: ', err.message);
    }
  };
  fetchCredentials();
} else {
  initializeSession();
};