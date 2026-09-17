const videoPublisherEl = document.querySelector('video-publisher');
const audioToggle = document.querySelector('#audio-toggle');
const videoToggle = document.querySelector('#video-toggle');

const videoSubscribersEl = document.querySelector('video-subscribers');

// Get a reference to the inputs-select element

// Set server URL
let serverURL;
let applicationId = 'YOUR_APPLICATION_ID';
let sessionId = 'YOUR_SESSION_ID';
let token = 'YOUR_TOKEN';

function initializeSession() {
  const session = OT.initSession(applicationId, sessionId);

  videoSubscribersEl.session = session;
  videoSubscribersEl.token = token;

  // Hide publisher related elements
  
  // Listen for event to hide the element, set the session, token and properties on video 

  audioToggle.addEventListener('click', () => {
    console.log('audioToggle!');
    videoPublisherEl.toggleAudio();
  });

  videoToggle.addEventListener('click', () => {
    console.log('videoToggle!');
    videoPublisherEl.toggleVideo();
  });

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