---
title: Why Vonage Video API Web Components?
description: Why Vonage Video API Web Components?
---

The <a href="https://github.com/Vonage-Community/web_components-video_api-javascript/" target="_blank">Vonage Video API Web Components</a> allow developers to quickly add common video call elements and functionality to their applications.

Currently, we have:

- **video-publisher** : Your video feed into the video call.

- **video-subscribers** : All the video feeds of other participants in the video call.

- **video-subscriber** : Used to dynamically add a single video call participant. Helpful if you want to style a screen share or other custom feed from a regular camera.

- **screen-share** : Share your screen to other participants in the call.

- **inputs-select** : Select your camera and microphone.

- **white-board** : Add a whiteboard to your video call.

- **live-chat** : Add a live chat room to your video call.

- **live-poll** : Add a poll allowing participants to vote on a question.

- **live-poll-control** : Adds the ability to create and edit a poll.

Let's take a look at what it takes to initialize a Publisher in a Vonage Video API Call:

```js
const session = OT.initSession(applicationId, sessionId);
// initialize the publisher
const publisherOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  resolution: '1280x720'
};
const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

// fires if user revokes permission to camera and/or microphone
publisher.on('accessDenied', (event) => {
  alert(event?.message);
});

// Connect to the session
session.connect(token, (error) => {
  if (error) {
    handleError(error);
  } else {
    // If the connection is successful, publish the publisher to the session
    session.publish(publisher, handleError);
  }
});

```

Here it is using the video-publisher Web Component:
```js
const videoPublisherEl = document.querySelector('video-publisher');
const session = OT.initSession(applicationId, sessionId);
videoPublisherEl.session = session;
videoPublisherEl.token = token;
videoPublisherEl.properties = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  resolution: '1280x720'
};
```

Let's start building some applications!