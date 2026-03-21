---
title: App to Phone
description: App to Phone application 
---

We'll be creating an application that can make phone calls.

The following code will be placed in the `app-to-phone.html` file.

First, we will need to load the Vonage Client SDK from a CDN (`<!-- ⌄⌄⌄ Load the Vonage Client SDK ⌄⌄⌄ -->`):
```html
<script src="https://cdn.jsdelivr.net/npm/@vonage/client-sdk@latest/dist/vonageClientSDK.min.js"></script>
```

> Note: You can also install the Client SDK and point to the nodes module folder if you are using a bundler.

Next, we'll add UI that the user will be using to make the phone call (`<!-- ⌄⌄⌄ HTML markup ⌄⌄⌄ -->`):
```html
<label for="phone-number">Your Phone Number:</label>
<input type="text" name="phone-number" value="" placeholder="i.e. 14155550100" id="phone-number" size="30">
<button type="button" id="call">Call</button>
<button type="button" id="hangup">Hang Up</button>
<div id="status"></div>
```

Now for the JavaScript.

First, we will get references to the UI elements, initialize the variables for the token, call ID and user as well as instantiate the Vonage Client (`// ⌄⌄⌄ Create references ⌄⌄⌄`):
```js
const callButton = document.getElementById("call");
const hangUpButton = document.getElementById("hangup");
const statusElement = document.getElementById("status");
let token;
const client = new vonageClientSDK.VonageClient();
let callId = null;
const user = 'Alice' // Just setting this so can quickly create a token and make a call with one click. In a production app, you'll want to authenticate a user before allowing them to make a call.
```

The client SDK will fire different <a href="https://vonage.github.io/client-sdk-api-docs/latest/ts/enums/LegStatus.html" target="_blank">events</a> while the call progresses. Let's set up the event listeners for when the call is "Answered" and "Completed" and update the UI accordingly (`// ⌄⌄⌄ Create an event listener for status updates ⌄⌄⌄`):
```js
client.on('legStatusUpdate', (callId, legId, status) => {
  if (status === "ANSWERED") {
    callButton.style.display = "none";
    callButton.disabled = false;
    hangUpButton.style.display = "inline";
    statusElement.innerText = "On a call";
  }
  if (status === "COMPLETED") {
    callId = null;
    callButton.style.display = "inline";
    callButton.disabled = false;
    hangUpButton.style.display = "none";
    statusElement.innerText = "";
  }
});
```

Let's set up what happens when the user clicks the `Call` button. We will get a token and create a session (`// ⌄⌄⌄ Make phone call when user clicks the Call button ⌄⌄⌄`):
```js
callButton.addEventListener("click", event => {
  const destination = document.getElementById("phone-number").value;
  if (destination) {
    // Fetch the JWT token for the user from your server
    fetch(`/token?name=${user}`)
      .then(response => response.json())
      .then(data => {
        token = data.token;
        client.createSession(token)
          .then(sessionId => {
            client.serverCall({ to: destination })
              .then((_callId) => {
                callId = _callId;
                statusElement.innerText = 'Calling ' + destination + '...';
                callButton.disabled = true;
              })
              .catch((error)=>{
                console.error(`Error making call: ${error}`);
              });
          })
          .catch(error  => { 
            console.error("Error creating session: ", error);
          });
      })
      .catch(error => {
        console.error("Error fetching token: ", error);
      });
  } else {
    alert("Please enter a phone number.");
  }
});
```

Let's set up what happens when the user clicks the `Hang Up` button (`// ⌄⌄⌄ Hang up the call when the user clicks the Hang Up button ⌄⌄⌄`):
```js
hangUpButton.addEventListener("click", () => {
  client.hangup(callId)
    .then(() => {
      hangUpButton.style.display = "none";
      callButton.style.display = "inline";
      callButton.disabled = false;
    })
    .catch(error => {
      console.error("Error hanging up call: ", error);
    });                
});
```

## Time to test the application!

In the tab/window that you opened the Application in, press refresh to make sure the changes have been applied.

Click the "App to Phone Call" link.

Enter your phone number into the input box and press the `Call` button.

Your phone should ring.

Answer the call.

Either hang up with your phone or press the `Hang Up` button in the application.