---
title: Add JavaScript
description: Get making video calls working.
---

Next, let's add some functionality to the application.

The following code snippets will be added to the `app.js` file in the `js` folder.

Since we are pulling the Backend Server URL from `config.js`, we need to let this file know. Place this at the top of the file:

```js
/* global SAMPLE_SERVER_BASE_URL OT */
```

Initialize the variables for the credentials.

```js
let applicationId;
let sessionId;
let token;
```

Create a function that will handle any errors that may happen:

```js
function handleError(error) {
  if (error) {
    console.error(error);
  }
}
```

Time to make a call to the backend server to fetch the credentials needed to initialize the video session:

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

Create a reference to the session (room) that you will be joining:

```js
const session = OT.initSession(applicationId, sessionId);
```

Set a listener for the `streamCreated` (someone joins the call) event. Set their video width and height to 100% (to take up the whole space of the container element) and add to the `subscriber` element.

```js
session.on('streamCreated', (event) => {
  const subscriberOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
});
```

Set another listener for the `sessionDisconnected` (you disconnect from the call) event.

```js
session.on('sessionDisconnected', (event) => {
  console.log('You were disconnected from the session.', event.reason);
});
```

Next, initialize your stream to the video call. Set the resolution to 1280x720 and add to the `publisher` element, matching the element's width and height 100%.

```js
const publisherOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  resolution: '1280x720'
};
const publisher = OT.initPublisher('publisher', publisherOptions, handleError);
```

Add a listener to handle if the user denies access to the camera and/or microphone:

```js
publisher.on('accessDenied', (event) => {
  alert(event?.message);
});
```

Time to connect to the session. If successful, publish your stream to the session. If there is an error, pass it to the error handling function:

```js
session.connect(token, (error) => {
  if (error) {
    handleError(error);
  } else {
    session.publish(publisher, handleError);
  }
});
```