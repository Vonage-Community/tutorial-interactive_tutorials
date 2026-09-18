---
title: Screensharing
description: Screensharing
---

To implement screensharing functionality to our application, we'll introduce 2 Web Components in addition to `video-publisher`:

- `screen-share` will allow the user to select what they want to share, show a preview and send the video into a call

- `video-subscriber` will be created and placed in the appropriate subscriber container based on the type of stream is created

First, we will load the Web Components into our application from a CDN.

Add this code to `screenshare.html` under `<!-- Load Web Components -->`:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@vonage/video-subscriber@latest/video-subscriber.js/+esm"></script>
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@vonage/screen-share@latest/screen-share.js/+esm"></script>
```

Next we need to add the `screen-share` custom element to our application under `<!-- Place screen-share here -->`

```html
<screen-share></screen-share>
<!-- <screen-share start-text="start" stop-text="stop"></screen-share> -->
```

> Note: I also added an example of how to change the button's text.

Let's open the `screenshare` application to see what it looks like.

The button looks kind of plain, let's add some styling in the `styles.css` under `/* video-subscriber and screen-share style */`

```css
video-subscriber {
  display: block;
  aspect-ratio: 16/9;
}

#camera video-subscriber {
  max-width: 300px;
}

screen-share::part(button) {
  font-size: 20px;
  color: white;
  background-color: black;
  border-radius: 5px;
}
```

> Note: We are using `::part` to change the styling of the Web Component

Refresh the page to see the new styling.

Now we'll be working in the `screenshare.js` file.

Like before, first thing we do is get a reference to the `screen-share` custom element.

Under `// Get a reference to the screen-share element` place:
```js
const screenShareEl = document.querySelector('screen-share');
```

Make sure to set the `serverURL` variable under `// Set server URL`.

It should look like:
```js
let serverURL="https://your-github-codespace65c9x65-3000.app.github.dev";
```

> Note: There is no '/' at the end of the URL

Next we'll set the token and session on the `screen-share` reference under
`// Set session and token for screen-share`:

```js
screenShareEl.session = session;
screenShareEl.token = token;
```

As mentioned before, `video-subcriber` allows for a more fine grained control of where the other streams will appear in our application. In the case of screensharing, we want the screen to show up much larger than a user's regular camera. The following code will create a `video-subscriber` element, check to see the type of stream that is coming in and append it to the correct container (either `camera` or `screen`). Place this under `// Create video-subscriber element, set properties, session and stream and depending on type, append to appropriate container` :

```js
const videoSubscriberEl = document.createElement('video-subscriber');
videoSubscriberEl.setAttribute('id', `${event.stream.streamId}`);
videoSubscriberEl.properties = { width: '100%', height: '100%' };
videoSubscriberEl.session = session;
videoSubscriberEl.stream = event.stream;
if (event.stream.videoType === 'camera') {
  videoSubscriberContainerCamera.appendChild(videoSubscriberEl);
} else if (event.stream.videoType === 'screen') {
  videoSubscriberContainerScreen.appendChild(videoSubscriberEl);
}
```

Let's share a screen! Refresh the page and open the application in another tab.

> Note: You will need headphones or mute your laptop to prevent feedback.

Were you able to share your screen?

Did the preview of what you shared show under the button?

Was the screenshare larger than the camera feed?

Next we will allow the user to select their microphone and camera.