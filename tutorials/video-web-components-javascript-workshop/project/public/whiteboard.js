const videoPublisherEl = document.querySelector('video-publisher');
const audioToggle = document.querySelector('#audio-toggle');
const videoToggle = document.querySelector('#video-toggle');

const videoSubscriberContainerCamera = document.querySelector('#camera');

const videoSubscriberContainerCustom = document.querySelector('#custom');

// Get a reference to the white-board related elements
const whiteboardEl = document.querySelector('white-board');
const whiteboardButton = document.querySelector('#whiteboard-button');
const whiteboardDialog = document.querySelector('#whiteboard-dialog');

// Set server URL
let serverURL;
let applicationId = 'YOUR_APPLICATION_ID';
let sessionId = 'YOUR_SESSION_ID';
let token = 'YOUR_TOKEN';

function initializeSession() {
  const session = OT.initSession(applicationId, sessionId);
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

  // Set session and token for white-board and add an event listener to open a modal

  session.on('streamCreated', function (event) {
    console.log('streamCreated!', event.stream.videoType);
    const videoSubscriberEl = document.createElement('video-subscriber');
    videoSubscriberEl.setAttribute('id', `${event.stream.streamId}`);
    videoSubscriberEl.properties = { width: '100%', height: '100%' };
    videoSubscriberEl.session = session;
    videoSubscriberEl.stream = event.stream;
    if (event.stream.videoType === 'camera') {
      videoSubscriberContainerCamera.appendChild(videoSubscriberEl);
    } else if (event.stream.videoType === 'custom') {
      videoSubscriberContainerCustom.appendChild(videoSubscriberEl);
    }
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