---
title: Select Inputs
description: Select Inputs
---

Previously, aside from the initial permission request, we have not allowed the user to select their camera and microphone before joining the video call.

The `inputs-select` Web Component will make this happen.

Let's load the Web Component in `select-inputs.html` under `<!-- Load Web Component -->`:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@vonage/inputs-select@latest/inputs-select.js/+esm"></script>
```

Next we need to add the `inputs-select` custom element to our application under `<!-- Place inputs-select here -->`

```html
<inputs-select>loading</inputs-select>
```

> Note: Any text placed inside the tags (ie, loading) will show up while the Web Component is loading and will be replaced by it's UI.

Let's open the `select inputs` application to see what it looks like.

Like with the `screenshare`'s button, let's change the styling in the `styles.css` under `/* inputs-select style */`

```css
inputs-select::part(button) {
  font-size: 20px;
  color: white;
  background-color: black;
  border-radius: 5px;
}
```

> Note: We are again using `::part` to change the styling of the Web Component

Refresh the page to see the new styling.

Now we'll be working in the `select-inputs.js` file.

As usual, we get a reference to the `inputs-select` custom element.

Under `// Get a reference to the inputs-select element` place:
```js
const inputsSelectEl = document.querySelector('inputs-select');
```

Don't forget to set the `serverURL` variable under `// Set server URL`.

It should look like:
```js
let serverURL="https://your-github-codespace65c9x65-3000.app.github.dev";
```

> Note: There is no '/' at the end of the URL


Since we won't need to see the `video-publisher` at first, let's hide it and the toggle buttons. Add this code under `// Hide publisher related elements`:

```js
videoPublisherEl.style.display = 'none';
audioToggle.style.display = 'none';
videoToggle.style.display = 'none';
```

Once the video and audio sources have been selected, a `inputsSelected` event is fired from the Web Component. When that happens, we will:

- hide the `inputs-selected` element 
- set the session, token and properties on the `video-publisher` reference
- show the `video-publisher` element
- start publishing into the video call
- show the toggle buttons

Add the following code will be added after `// Listen for event to hide the element, set the session, token and properties on video`

```js
inputsSelectEl.addEventListener('inputsSelected', (event) => {
  inputsSelectEl.style.display = 'none';
  videoPublisherEl.session = session;
  videoPublisherEl.token = token;
  videoPublisherEl.properties = {
    fitMode: 'cover',
    height: '100%',
    resolution: '1920x1080',
    videoContentHint: 'detail',
    width: '100%',
    audioSource: event.detail.audioSource,
    videoSource: event.detail.videoSource,
  };
  videoPublisherEl.style.display = 'block';
  videoPublisherEl.startPublish();
  audioToggle.style.display = 'inline';
  videoToggle.style.display = 'inline';
});
```


Refresh the page and open the application in another tab.

> Note: You will need headphones or mute your laptop to prevent feedback.

Could you select the microphone and camera?

Let's add a whiteboard next.