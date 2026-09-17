const videoPublisherEl = document.querySelector('video-publisher');
const audioToggle = document.querySelector('#audio-toggle');
const videoToggle = document.querySelector('#video-toggle');

// Get a reference to the screen-share element

const videoSubscriberContainerCamera = document.querySelector('#camera');

const videoSubscriberContainerScreen = document.querySelector('#screen');

// Set server URL
let serverURL;
let applicationId = 'YOUR_APPLICATION_ID';
let sessionId = 'YOUR_SESSION_ID';
let token = 'YOUR_TOKEN';

function initializeSession() {
  const session = OT.initSession(applicationId, sessionId);

  if (videoPublisherEl) {
    videoPublisherEl.session = session;
    videoPublisherEl.token = token;
    videoPublisherEl.properties = {
      fitMode: 'cover',
      height: '100%',
      resolution: '1920x1080',
      videoContentHint: 'detail',
      width: '100%',
    };

    audioToggle.addEventListener('click', () => {
      console.log('audioToggle!');
      videoPublisherEl.toggleAudio();
    });

    videoToggle.addEventListener('click', () => {
      console.log('videoToggle!');
      videoPublisherEl.toggleVideo();
    });
  }

  // Set session and token for screen-share

  session.on('streamCreated', function (event) {
    console.log('streamCreated!', event.stream.videoType);
    // Create video-subscriber element, set properties, session and stream and depending on type, append to appropriate container
    
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