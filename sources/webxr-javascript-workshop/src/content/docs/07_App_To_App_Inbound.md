---
title: App to App (Inbound)
description: App to App (Inbound) application 
---

To finish the App to App voice call, we will create the page that will receive the call (inbound).

The following code will be placed in the `app-to-app-inbound.html` file.

First, we will need to load the Vonage Client SDK from a CDN (`<!-- ⌄⌄⌄ Load the Vonage Client SDK ⌄⌄⌄ -->`):
```html
<script src="https://cdn.jsdelivr.net/npm/@vonage/client-sdk@latest/dist/vonageClientSDK.min.js"></script>
```

> Note: You can also install the Client SDK and point to the nodes module folder if you are using a bundler.

Next, we'll add UI that the user will be using receiving the incoming call (`<!-- ⌄⌄⌄ HTML markup ⌄⌄⌄ -->`):
```html
<h1>Inbound App Call (<span id="user-name"></span>)</h1>
<p id="notification">logging in...</p>
<br />
<button id="answer">Answer</button>
```

Now for the JavaScript.

First, we will get references to the UI elements, initialize the variables for the token, call ID and pull the user from the URL as well as instantiate the Vonage Client (`// ⌄⌄⌄ Create references ⌄⌄⌄`):
```js
// Get user from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get('user') || 'Bob';
const answerButton = document.getElementById("answer");
const notification = document.getElementById("notification");
let token;
const client = new vonageClientSDK.VonageClient();
let callId = null;
```

The client SDK will fire different <a href="https://vonage.github.io/client-sdk-api-docs/latest/ts/interfaces/VonageEvent.html" target="_blank">events</a> during the calls lifecycle. Let's set up the event listeners for when the call is incoming or hung up and update the UI accordingly (`// ⌄⌄⌄ Create Client event listeners for call lifecycle ⌄⌄⌄`):
```js
    client.on('callInvite', (_callId) => {
      callId = _callId;
      notification.textContent = "You are receiving a call";
      answerButton.style.display = "inline";
    });

    client.on('callHangup', (callId, callQuality, reason) => {
      callId = null;
      notification.textContent = "Lines are open for calls...";
      answerButton.style.display = "none";
    });

```

Let's set up what happens when the user clicks the `Answer` button (`// ⌄⌄⌄ Click the Answer button to connect to the call ⌄⌄⌄`):
```js
// Answer the call.
answerButton.addEventListener("click", () => {
  client.answer(callId)
    .then(() => {
      console.log("Success answering call.");
      notification.textContent = "You are on a call";
      answerButton.style.display = "none";
    })
    .catch(error => {
      console.error("Error answering call: ", error);
    });    
});
```

As soon as the page loads, we will get a token and create a session (`// ⌄⌄⌄ Get token and create a Session as soon as the page loads ⌄⌄⌄`):
```js
window.onload = () => {
  if (user) {
    // Fetch the JWT token for the user from your server
    fetch(`/token?name=${user}`)
    .then(response => response.json())
    .then(data => {
        token = data.token;
        console.log("Fetched token: ", token);
        client.createSession(token)
        .then(sessionId => {
            document.getElementById("user-name").textContent = user;
            console.log("Id of created session: ", sessionId);
            notification.textContent = "Lines are open for calls...";
        })
        .catch(error  => { 
            console.error("Error creating session: ", error);
        });
    })
    .catch(error => {
        console.error("Error fetching token: ", error);
    });
  } else {
      alert("Please enter a username.");
  }
};
```

## Time to test the application!

In the tab/window that you opened the Application in, press refresh to make sure the changes have been applied.

Click the "App to App Call" link.

Enter your name to log in.

Enter in the name of the person that will be answering the call. This will open a new window/tab and log in the user answering the call.

In the window/tab of the user making the call, press the `Call` button.

In the window/tab of the user receiving the call, press the `Answer` button. 

Hang up by pressing the `Hang Up` button in the sender's page.