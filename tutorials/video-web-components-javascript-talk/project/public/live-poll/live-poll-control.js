// const videoPublisherEl = document.querySelector('video-publisher');
// const audioToggle = document.querySelector('#audio-toggle');
// const videoToggle = document.querySelector('#video-toggle');

// const videoSubscribersEl = document.querySelector('video-subscribers');

// Get a reference to the live-poll-control element
const livePollControlEl = document.querySelector('live-poll-control');
const passwordSection = document.querySelector('#passwordSection');
const passwordInput = document.querySelector('#passwordInput');
const passwordBtn = document.querySelector('#passwordBtn');
const videoChatContainer = document.querySelector('#video-chat-container');


let serverURL = `${window.location.origin}`;
let applicationId = 'YOUR_APPLICATION_ID';
let sessionId = 'YOUR_SESSION_ID';
let token = 'YOUR_TOKEN';

function initializeSession() {
  const session = OT.initSession(applicationId, sessionId);
  // Set session and token (and optionally properties) for Web Components
  // videoPublisherEl.session = session;
  // videoPublisherEl.token = token;
  // videoPublisherEl.properties = {
  //   fitMode: 'cover',
  //   height: '100%',
  //   resolution: '1920x1080',
  //   videoContentHint: 'detail',
  //   width: '100%',
  // };

  // audioToggle.addEventListener('click', () => {
  //   console.log('audioToggle!');
  //   videoPublisherEl.toggleAudio();
  // });

  // videoToggle.addEventListener('click', () => {
  //   console.log('videoToggle!');
  //   videoPublisherEl.toggleVideo();
  // });

  // videoSubscribersEl.session = session;
  // videoSubscribersEl.token = token;

  // Set session and token for live-poll-control
  livePollControlEl.session = session;
  livePollControlEl.token = token;


}

passwordBtn.addEventListener('click', async () => {
  // console.log(passwordInput.value);
  if (passwordInput.value && serverURL) {
    try {
      const response = await fetch(serverURL + '/login', {
        method: "POST", // Specify the request method
        headers: {
          "Content-Type": "application/json", // Tell the server what format you are sending
        },
        body: JSON.stringify({ password: passwordInput.value }), // The body payload must match the Content-Type header
      });

      // fetch() only rejects on network errors; you must handle HTTP errors (like 404 or 500) manually
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // const result = await response.json(); // Parse the JSON response from the server
      // console.log("Success:", result);
      // return result;
      passwordSection.style.display = "none";
      videoChatContainer.style.display = "flex";
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
    } catch (error) {
      console.error("Error during POST request:", error);
    }

  }

});

