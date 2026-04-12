---
title: Phone to App
description: Phone to App application 
---

We'll be creating an application that can receive phone calls.

The following code will be placed in the `phone-to-app.html` file.

First, we will need to load the Vonage Client SDK from a CDN (`<!-- ⌄⌄⌄ Load the Vonage Client SDK ⌄⌄⌄ -->`):
```html
<script src="https://cdn.jsdelivr.net/npm/@vonage/client-sdk@latest/dist/vonageClientSDK.min.js"></script>
```

> Note: You can also install the Client SDK and point to the nodes module folder if you are using a bundler.

Next, we'll add UI that the user will be using to receive the phone call (`<!-- ⌄⌄⌄ HTML markup ⌄⌄⌄ -->`):
```html
<div id="login">
  <h1>Login</h1>
  <p>To receive a call from a PSTN phone, you need to login first.</p>
  <label for="name">Name:</label>
  <input type="text" name="name" value="" placeholder="i.e. ALICE" id="name" size="30">
  <br /><br />
  <button type="button" id="login-button">Login</button>
</div>
<div id="app">
  <h1>Inbound PSTN phone call</h1>
  <p id="notification">Lines are open for calls...</p>
  <br />
  <button type="button" id="answer">Answer</button>
  <button type="button" id="reject">Reject</button>
  <button type="button" id="hangup">Hang Up</button>
</div>
```

Now for the JavaScript.

First, we will get references to the UI elements, initialize the variables for the token, and call ID as well as instantiate the Vonage Client (`// ⌄⌄⌄ Create references ⌄⌄⌄`):
```js
const answerButton = document.getElementById("answer");
const rejectButton = document.getElementById("reject");
const hangUpButton = document.getElementById("hangup");
const notification = document.getElementById("notification");
let token;
const client = new vonageClientSDK.VonageClient();
let callId = null;
```

The client SDK will fire different <a href="https://vonage.github.io/client-sdk-api-docs/latest/ts/interfaces/VonageEvent.html" target="_blank">events</a> during the calls lifecycle. Let's set up the event listeners for when the call is incoming, if the call is cancelled or hung up as well as any status updates and update the UI accordingly (`// ⌄⌄⌄ Create Client event listeners for call lifecycle ⌄⌄⌄`):
```js
client.on('callInvite', (_callId, from, channelType) => {
  callId = _callId;
  console.log(`Incoming call from ${from} via ${channelType}, callId: ${callId}`);
  notification.textContent = "You are receiving a call";
  answerButton.style.display = "inline";
  rejectButton.style.display = "inline";
});

client.on('legStatusUpdate', (_callId, legId, status) => {
  notification.textContent = `Caller Leg Status is: ${status}`;
});

client.on('callInviteCancel', (_callId) => {
  console.log(`Call invite has been cancelled, callId: ${_callId}`);
  callId = null;
  notification.textContent = "The caller has cancelled the call";
  answerButton.style.display = "none";
  rejectButton.style.display = "none";
  hangUpButton.style.display = "none";
  setTimeout(() => {
    notification.textContent = "Lines are open for calls...";
  }, 3000);
});

client.on("callHangup", (_callId, callQuality, reason) => {
  console.log(`Call ${_callId} has hung up, callQuality:${callQuality}, reason:${reason}`);
  callId = null;
  notification.textContent = "Lines are open for calls...";
  answerButton.style.display = "none";
  rejectButton.style.display = "none";
  hangUpButton.style.display = "none";
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
      rejectButton.style.display = "none";
      hangUpButton.style.display = "inline";
    })
    .catch(error => {
      console.error("Error answering call: ", error);
    });    
});
```

The User can also reject the call by pressing the `Reject` button (`// ⌄⌄⌄ Click the Reject button to reject the call ⌄⌄⌄`):
```js
// Reject the call
rejectButton.addEventListener("click", () => {
  client.reject(callId)
    .then(() => {
      console.log("Success rejecting call.");
      notification.textContent = "You rejected the call";
      answerButton.style.display = "none";
      rejectButton.style.display = "none";
      setTimeout(() => {
        notification.textContent = "Lines are open for calls...";
      }, 3000);

    })
    .catch(error => {
      console.error("Error rejecting call: ", error);
    });          
});
```

Let's set up what happens when the user clicks the `Hang Up` button (`// ⌄⌄⌄ Hang up the call when the user clicks the Hang Up button ⌄⌄⌄`):
```js
// Hang up the call
hangUpButton.addEventListener("click", () => {
  client.hangup(callId)
    .then(() => {
      console.log("Success hanging up call.");
      notification.textContent = "You ended the call";
      answerButton.style.display = "none";
      rejectButton.style.display = "none";
      hangUpButton.style.display = "none";
      setTimeout(() => {
        notification.textContent = "Lines are open for calls...";
      }, 3000);
    })
    .catch(error => {
      console.error("Error hanging up call: ", error);
    });                
});
```

Before the User can accept any incoming phone calls, they will need a token to create a session. Let's do that when they click the `Login` button (`// ⌄⌄⌄ Log in user ⌄⌄⌄`):
```js
document.getElementById("login-button").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  if (name) {
    // Fetch the JWT token for the user from your server
    fetch(`/token?name=${name}`)
      .then(response => response.json())
      .then(data => {
        token = data.token;
        client.createSession(token)
          .then(sessionId => {
            document.getElementById("login").style.display = "none";
            document.getElementById("app").style.display = "block";
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
});
```


## Time to test the application!

In the tab/window that you opened the Application in, press refresh to make sure the changes have been applied.

Click the "Phone to App Call" link.

Enter a name into the input box and press the `Login` button.

Using your phone, place a call to your Vonage Phone Number.

The status of the UI should indicate that there is an incoming phone call.

You can Answer or Reject the call.

Either hang up with your phone or press the `Hang Up` button in the application.