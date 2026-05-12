---
title: Add JavaScript
description: Get making video calls working.
---

Next, let's add some functionality to the application.

The following code snippets will be added to the `app.js` file in the `js` folder.

Since we are pulling the Backend Server URL from `config.js` and loading the Vonage Video Client SDK from a CDN, we need to let this file know to prevent linting errors. Place this at the top of the file `// Initialize global references`:

```js
/* global SAMPLE_SERVER_BASE_URL OT */
```

Initialize the variables for the credentials and set references for the buttons `// Initialize credential variables and button references`:

```js
let applicationId;
let sessionId;
let token;

const publishVideoTrueBtn = document.querySelector('#publish-video-true');
const publishVideoFalseBtn = document.querySelector('#publish-video-false');
```

Create a function that will handle any errors that may happen `// Function to handle any errors`:

```js
function handleError(error) {
  if (error) {
    console.error(error);
  }
}
```

Time to make a call to the backend server to fetch the credentials needed to initialize the video session `// Code to fetch credentials`:

```js
fetch(SAMPLE_SERVER_BASE_URL + '/session')
.then((response) => response.json())
.then((json) => {
  applicationId = json.applicationId;
  sessionId = json.sessionId;
  token = json.token;
  // Initialize an Vonage Video Session object
  initializeSession();
}).catch((error) => {
  handleError(error);
  alert('Failed to get Vonage Video sessionId and token. Make sure you have updated the config.js file.');
});
```

The following code will be added to the `initializeSession` function.

Create a reference to the session (room) that you will be joining `// Create a reference to the session`:

```js
const session = OT.initSession(applicationId, sessionId);
```

Set a listener for the `streamCreated` (someone joins the call) event. Set their video height and width to 100% and add to the `participants` element `// Listen for streamCreated event`:

```js
session.on('streamCreated', (event) => {
  const subscriberOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  session.subscribe(event.stream, 'participants', subscriberOptions, handleError);
});
```

Set another listener for the `sessionDisconnected` (you disconnect from the call) event `// Listen for sessionDisconnected event`:

```js
session.on('sessionDisconnected', (event) => {
  console.log('You were disconnected from the session.', event.reason);
});
```

Next, initialize your stream to the video call. Set the resolution to 1280x720 and add to the `participants` element, matching the element's width and height 100% `// Initialize your stream to the call`:

```js
const publisherOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  resolution: '1280x720'
};
const publisher = OT.initPublisher('participants', publisherOptions, handleError);
```

Add a listener to handle if the user denies access to the camera and/or microphone `// Listen for the event fired when the user denies access`:

```js
publisher.on('accessDenied', (event) => {
  alert(event?.message);
});
```

Time to connect to the session. If successful, publish your stream to the session. If there is an error, pass it to the error handling function `// Connect to the session`:

```js
session.connect(token, (error) => {
  if (error) {
    handleError(error);
  } else {
    session.publish(publisher, handleError);
  }
});
```

Finally, add the ability to publish and unpublish your video to the buttons `// Add toggle video publishing / unpublishing to buttons`:

```js
publishVideoTrueBtn.addEventListener('click',() => {
  publisher.publishVideo(true, (error) => {
    if (error) {
      handleError(error);
    } else {
      publishVideoTrueBtn.style.display = 'none';
      publishVideoFalseBtn.style.display = 'block';
    }
  });
});

publishVideoFalseBtn.addEventListener('click',() => {
  publisher.publishVideo(false, (error) => {
    if (error) {
        alert('error: ', error);
    } else {
      publishVideoFalseBtn.style.display = 'none';
      publishVideoTrueBtn.style.display = 'block';
    }
  });
});

```
