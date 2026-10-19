---
title: Live Chat
description: Live Chat
---

Another good use of the Vonage Video Signaling API is to add live chat functionality to your application.

The `live-chat` Web Component was created to be a reusable element to prevent having to recreate the logic for every application you want to have a chat.

In `live-chat.html`, let's load the Web Component under `<!-- Load Web Component -->`:

```html
<<script type="module" src="https://cdn.jsdelivr.net/npm/@vonage/live-chat@latest/live-chat.js/+esm"></script>
```

Add the `live-chat` custom element under `<!-- Place live-chat here -->`:

```html
<live-chat></live-chat>
```

Open the `live chat` application to see what it looks like.

The `live-chat` Web Component is highly customizable so it can have the same styling of your application. Add the following styling in the `styles.css` under `/* live-chat style */`

```css
live-chat {
  height: 100%;
  width: 30vw;
}

live-chat::part(history) {
  height: 300px;
  overflow-y: auto;
}

live-chat::part(form) {
  display: flex;
}

live-chat::part(input) {
  width: 100%;
}

live-chat::part(message) {
  padding: 15px;
  margin: 5px;
}

live-chat::part(message mine) {
  text-align: right;
}

live-chat::part(message-text) {
  background-color: #f0f0f0;
  display: inline-block;
  padding: 2px 8px;
  margin: 0;
  border-radius: 6px 6px 6px 0;
  font-size: 1.4rem;
}

live-chat::part(message-text mine) {
  background-color: #e0e0ff;
  border-radius: 6px 6px 0px 6px;
}

live-chat::part(message-image mine) {
  background-color: #e0e0ff;
  border-radius: 6px 6px 0px 6px;
}

live-chat::part(message-sender) {
  font-size: 0.8rem;
  margin: 0;
  padding: 0;
}

live-chat::part(message-sender mine) {
  text-align: right;
  color: black;
}
```

> Note: the styling for this Web Component uses `::part` to change the styling of a lot of the individual elements that make up the Web Component

Refresh the page to see the new styling.

Next, we'll be working in the `live-chat.js` file.

Just like every example so far, we get a reference to the `live-chat` custom element.

Under `// Get a reference to the live-chat element` place:
```js
const liveChatEl = document.querySelector('live-chat');
```

Make sure to set the `serverURL` variable under `// Set server URL`.

It should look like:
```js
let serverURL="https://your-github-codespace65c9x65-3000.app.github.dev";
```

> Note: There is no '/' at the end of the URL



Add the following code that will set the session and token for the Web Component as well as set the username, randomly picked an array after `// Set session and token for live-chat and select a random value to pass in as the username`

```js
const names = ['Alice', 'Bob', 'Carl', 'Darryl', 'Ed']
liveChatEl.session = session;
liveChatEl.token = token;
liveChatEl.username = names[Math.floor(Math.random() * names.length)];
```

Refresh the page and open the application in another tab.

> Note: You will need headphones or mute your laptop to prevent feedback.

Were you able to chat successfully?

Adding the ability to add and participate in live polls will be added next.