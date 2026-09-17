---
title: Basic Video Call
description: Basic Video Call
---

We will be creating a basic video call app where you will be able to:

- send your video into a call and turn on/off your camera and microphone (video-publisher)

- view all other participants' video feed (video-subscribers)

First, we will load the Web Components into our application from a CDN.

Add this code to `basic.html` under `<!-- Load Web Components -->`:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@vonage/video-publisher@latest/video-publisher.js/+esm"></script>
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@vonage/video-subscribers@latest/video-subscribers.js/+esm"></script>
```

Next we need to add the `video-publisher` custom element to our application under `<!-- Place video-publisher here -->`

```html
<video-publisher></video-publisher>
```

Do the same for `video-subscribers` under 
`<!-- Place video-subscribers here -->`

```html
<video-subscribers></video-subscribers>
```

Then let's add some styling and layout in the `styles.css` under `/* video-publisher and video-subscribers style */`

```css
video-publisher {
  display: block;
  aspect-ratio: 16/9;
}

video-subscribers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  place-items: center;
}
```

So far, we've loaded and added the Web Components in the HTML file as well as styled them with CSS.

Let's add some functionality in the `basic.js` file.

We need to create references to the Web Components. Since they are just like regular HTML elements, you can get a reference the same way.

Under `// Get a reference to the video-publisher element` place:
```js
const videoPublisherEl = document.querySelector('video-publisher');
```

Under `// Get a reference to the video-subscribers element` place:
```js
const videoSubscribersEl = document.querySelecto('video-subscribers');
```

In order to get the credentials needed for the Web Components to do their jobs, we will need a server. Luckily, when the Codespace was setup, we also spun up a server that we can use. Remember that `APPLICATION READY` URL you opened in a tab? Set that to the `serverURL` variable under `// Set server URL`.

It should look like:
```js
let serverURL="https://your-github-codespace65c9x65-3000.app.github.dev";
```

> Note: There is no '/' at the end of the URL

Now that we can generate a `token` and get the `session` for our application to join, add this code under
`// Set session and token (and optionally properties) for video-publisher`:

```js
videoPublisherEl.session = session;
videoPublisherEl.token = token;
videoPublisherEl.properties = {
  fitMode: 'cover',
  height: '100%',
  resolution: '1920x1080',
  videoContentHint: 'detail',
  width: '100%',
};
```

The `video-publisher` Web Component has the ability to toggle the camera and microphone on and off. Add this code under `// Add toggling audio and video functionality` to add this functionality to the buttons:

```js
audioToggle.addEventListener('click', () => {
  console.log('audioToggle!');
  videoPublisherEl.toggleAudio();
});

videoToggle.addEventListener('click', () => {
  console.log('videoToggle!');
  videoPublisherEl.toggleVideo();
});
```

Finally, let's add the `session` and `token` to the `video-subscribers` element under `// Set session and token for video-subscribers`:

```js
videoSubscribersEl.session = session;
videoSubscribersEl.token = token;
```

Let's see it in action! Open the `basic` link in a couple of tabs.

> Note: You will need headphones or mute your laptop to prevent feedback.

Do you see yourself under Publisher and Subscribers?

Does toggling the audio and video work?

Next we will add screensharing to our application.