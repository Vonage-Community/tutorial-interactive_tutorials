---
title: Live Poll
description: Live Poll
---

Being able to get immediate feedback from a group during a video call can help increase engagement. One of the best ways is with live polls. Let's add that functionality now.

Integrating live polls involves 2 Web Components:

- **live-poll-control** : Provides admin functionality to create, edit, start, stop, and clear polls.

- **live-poll** : Allows participants to vote in polls.

## Live Poll Control

Let's start with `live-poll-control`.

Load the Web Component in `live-poll/live-poll-control.html` under `<!-- Load Web Component -->`:

```html
<script type="module"
    src="https://cdn.jsdelivr.net/npm/@vonage/live-poll-control@latest/live-poll-control.js/+esm"></script>
```

Next, add the `live-poll-control` custom element to our application under `<!-- Place live-poll-control here -->`

```html
<live-poll-control></live-poll-control>
```

Navigate to the `live poll` folder and open the `live poll control` application to see what it looks like.

Looking pretty plain, right? Let's add some styling in the `styles.css` under `/* live-poll-control style */`

```css
live-poll-control {
  --live-poll-control-nth-child-odd-color: #dbd9d9;
  --live-poll-control-nth-child-even-color: #fcfcfc;
}

live-poll-control::part(options) {
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: auto;
  list-style: none;
}

live-poll-control::part(option) {
  padding: 10px;
}

live-poll-control::part(option-container) {
  display: block;
}

live-poll-control::part(button) {
  color: white;
  padding: 5px 15px;
  background-color: transparent;
  border: 1px solid black;
  border-radius: 6px;
  cursor: pointer;
  background: #871fff;
  font-size: 1.4rem;
}
```

> Note: We are using `CSS variables` in addition to `::part`. I wasn't sure how else to get alternating colors for the option rows.

Refresh the page to see the new styling.

Let's get the `live-poll-control` working. Navigate to the `live-poll/live-poll-control.js` file.

Let's create a reference to the `live-poll-control` custom element.

Under `// Get a reference to the live-poll-control element` place:
```js
const livePollControlEl = document.querySelector('live-poll-control');
```

Don't forget to set the `serverURL` variable under `// Set server URL`.

It should look like:
```js
let serverURL="https://your-github-codespace65c9x65-3000.app.github.dev";
```

> Note: There is no '/' at the end of the URL

Let's add the `session` and `token` to the `live-poll-control` element under `// Set session and token for live-poll-control`:

```js
livePollControlEl.session = session;
livePollControlEl.token = token;
```

## Live Poll

Now we are going to set up the `live-poll` Web Component so that we can vote in the polls that the `live-poll-control` Web Component creates.

Like all the times previously, we'll start in the HTML file, so navigate to `live-poll/live-poll.html` and load the Web Component under `<!-- Load Web Component -->`:
```html
<script type="module"
    src="https://cdn.jsdelivr.net/npm/@vonage/live-poll@latest/live-poll.js/+esm"></script>
```

Now add the `live-poll` custom element to our application under `<!-- Place live-poll here -->`

```html
<live-poll></live-poll>
```

Next, we will make the `live-poll` Web Component functional so we can see the poll in action. Open the `live-poll/live-poll.js` file.

Let's create a reference to the `live-poll` custom element.

Under `// Get a reference to the live-poll element` place:
```js
const livePollEl = document.querySelector('live-poll');
```

Don't forget to set the `serverURL` variable under `// Set server URL`.

It should look like:
```js
let serverURL="https://your-github-codespace65c9x65-3000.app.github.dev";
```

> Note: There is no '/' at the end of the URL

Let's add the `session` and `token` to the `live-poll` element under `// Set session and token for live-poll`:

```js
livePollEl.session = session;
livePollEl.token = token;
```

Time to test if things are working to this point.

Make sure you have the `live poll control` and `live poll` applications open.

> Note: You will need headphones or mute your laptop to prevent feedback.

In the `live poll control` application, try creating a poll with some options and then click start.

The poll should show up in the `live poll` application. How do you like the styling? Let's change it.

In the `styles.css` under `/* live-poll style */` add this styling:

```css
live-poll {
  --live-poll-nth-child-odd-color: #dbd9d9;
  --live-poll-nth-child-even-color: #fcfcfc;
}

live-poll::part(options) {
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: auto;
  list-style: none;
}

live-poll::part(option) {
  padding: 10px;
}

live-poll::part(option-container) {
  display: block;
}

live-poll::part(progress) {
  margin-left: 20px;
}

live-poll::part(button) {
  color: white;
  padding: 5px 15px;
  background-color: transparent;
  border: 1px solid black;
  border-radius: 6px;
  cursor: pointer;
  background: #871fff;
  font-size: 1.4rem;
}
```

> Note: We are using `CSS variables` in addition to `::part`. I wasn't sure how else to get alternating colors for the option rows.


Are you able to create a poll and vote in it?

If so, continue to the next step!

