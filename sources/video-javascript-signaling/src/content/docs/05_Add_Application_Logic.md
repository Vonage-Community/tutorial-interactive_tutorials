---
title: Add JavaScript
description: Get making video calls working.
---

Let's add some functionality to the application.

The following code snippets will be added to the `app.js` file in the `js` folder.

Get references to the text chat UI elements (`// ⌄⌄⌄ get references to text chat UI ⌄⌄⌄`):

```js
const msgHistory = document.querySelector('#history');
const form = document.querySelector('form');
const msgTxt = document.querySelector('#msgTxt');
```

In the `initializeSession()` function, add an event listener to the session for `signal:msg` that will add the message to the chat history as well as style the message based on if it is yours or another participant. Also scroll the message into view. (`// ⌄⌄⌄ add session listener for a signal message ⌄⌄⌄`):

```js
session.on('signal:msg', (event) => {
  const msg = document.createElement('p');
  msg.textContent = event.data;
  msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
  msgHistory.appendChild(msg);
  msg.scrollIntoView();
});
```

Next, add an event listener to the form that when a submit happens, send a signal of `type:'msg'` with the chat message entered in the input field. If the message successfully sent, clear the input field and if there is an error, pass it to the error handling function (`// ⌄⌄⌄ send a signal with chat message when submitting a form ⌄⌄⌄`):

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();

  session.signal({
    type: 'msg',
    data: msgTxt.value
  }, (error) => {
    if (error) {
      handleError(error);
    } else {
      msgTxt.value = '';
    }
  });
});
```
