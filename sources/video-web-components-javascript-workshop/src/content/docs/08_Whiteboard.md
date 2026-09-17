---
title: Whiteboard
description: Whiteboard
---

The `white-board` Web Component was a requested feature. It's a great example of what can be created with the the Vonage Video's Signaling API.

The `inputs-select` Web Component will make this happen.

Let's load the Web Component in `whiteboard.html` under `<!-- Load Web Component -->`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@vonage/white-board@latest/white-board.js/+esm"></script>
```

Next we need to add the `white-board` custom element to our application under `<!-- Place white-board here -->`

```html
<white-board></white-board>
<!-- <white-board text='{"tools": "tools!!!", "pen":"Pencil"}' /> -->
```

> Note: I also added an example of how you can make some modifications.

Let's open the `whiteboard` application to see what it looks like.

Like with the `screenshare`'s button, let's change the styling in the `styles.css` under `/* white-board style */`

```css
white-board::part(tools button) {
  font-size: 10px;
  color: white;
  background-color: black;
  border-radius: 5px;
}
```

> Note: We are again using `::part` to change the styling of a specific part of the Web Component

Refresh the page to see the new styling.

Now we'll be working in the `whiteboard.js` file.

As usual, we get a reference to the `white-board` custom element.

Under `// Get a reference to the white-board related elements` place:
```js
const whiteboardEl = document.querySelector('white-board');
const whiteboardButton = document.querySelector('#whiteboard-button');
const whiteboardDialog = document.querySelector('#whiteboard-dialog');
```

Remember to set the `serverURL` variable under `// Set server URL`.

It should look like:
```js
let serverURL="https://your-github-codespace65c9x65-3000.app.github.dev";
```

> Note: There is no '/' at the end of the URL


The way that the `white-board` Web Component works is that when button is clicked, it opens the dialog element that holds the . Add this code under `// Set session and token for white-board and add an event listener to open a modal`:

```js
whiteboardEl.session = session;
whiteboardEl.token = token;

whiteboardButton.addEventListener('click', () => {
  whiteboardDialog.showModal();
});
```

Refresh the page and open the application in another tab.

> Note: You will need headphones or mute your laptop to prevent feedback.

Take a second to test the whiteboard.

Were you able to see the whiteboard in the other page?

If you open the whiteboard in both applications, can you see the other marks made in the other page.

Let's add a live chat next.