---
title: App to App (Outbound)
description: App to App (Outbound) application 
---

This application will allow one User can call another User.

We will start with the User that will be initiating the call (outbound).

The user will log into the application. Then they will "log in" the User that will be receiving the call.

The following code will be placed in the `app-to-app-outbound.html` file.

First, we will need to load the Vonage Client SDK from a CDN (`<!-- ⌄⌄⌄ Load the Vonage Client SDK ⌄⌄⌄ -->`):
```html
<script src="https://cdn.jsdelivr.net/npm/@vonage/client-sdk@latest/dist/vonageClientSDK.min.js"></script>
```

> Note: You can also install the Client SDK and point to the nodes module folder if you are using a bundler.

Next, we'll add UI that will log in the user that will be making the outbound call (`<!-- ⌄⌄⌄ Login Outbound User HTML markup ⌄⌄⌄ -->`):
```html
<div id="login-outbound">
  <p>1. Enter name of user making the call:</p>
  <label for="name-outbound">Name:</label>
  <input type="text" name="name-outbound" value="" placeholder="i.e. ALICE" id="name-outbound" size="30">
  <br /><br />
  <button type="button" id="login-button-outbound">Login</button>
</div>
```

Now, let's add UI that will login the user will be receiving the call (`<!-- ⌄⌄⌄ Login Inbound User HTML markup ⌄⌄⌄ -->`):
```html
<div id="login-inbound">
  <p>Logged in as: <span id="logged-in-user"></span></p>
  <p>2. Enter name of user receiving the call:</p>
  <label for="name-inbound">Name:</label>
  <input type="text" name="name-inbound" value="" placeholder="i.e. BOB" id="name-inbound" size="30">
  <br /><br />
  <small>*This will open a new tab and log in as this user.</small>
  <br />
  <button type="button" id="login-button-inbound">Login</button>
</div>
```

This is the UI that the outbound User will use to control the call (`<!-- ⌄⌄⌄ Call Controls HTML markup ⌄⌄⌄ -->`):
```html
<div id="call-controls">
  <small>*Answer the call in the other tab.</small>
  <button type="button" id="call">Call <span id="call-to-name"></span></button>
  <button type="button" id="hangup">Hang Up</button>
</div>
```

Now for the JavaScript.

First, we will get references to the UI elements, initialize the variables for the token, call ID and both inbound and outbound usernames as well as instantiate the Vonage Client (`// ⌄⌄⌄ Create references ⌄⌄⌄`):
```js
const callButton = document.getElementById("call");
const hangUpButton = document.getElementById("hangup");
let token;
const client = new vonageClientSDK.VonageClient();
let callId = null;
let inboundUsername;
let inboundDisplayName;
let outboundDisplayName;
```

The client SDK will fire different <a href="https://vonage.github.io/client-sdk-api-docs/latest/ts/enums/LegStatus.html" target="_blank">events</a> while the call progresses. Let's set up the event listeners for when the call is "Answered" and "Completed" and update the UI accordingly (`// ⌄⌄⌄ Create an event listener for status updates ⌄⌄⌄`):
```js
client.on('legStatusUpdate', (callId, legId, status) => {
  if (status === "ANSWERED") {
      callButton.style.display = "none";
      hangUpButton.style.display = "inline";
  }
  if (status === "COMPLETED") {
      callButton.style.display = "inline";
      hangUpButton.style.display = "none";
  }
});
```

Let's set up what happens when the user clicks the `Call` button. We will get a token and create a session (`// ⌄⌄⌄ Make phone call when user clicks the Call button ⌄⌄⌄`):
```js
callButton.addEventListener("click", () => {
  client.serverCall({ to: inboundUsername })
    .then((_callId) => {
      callId = _callId;
    })
    .catch((error)=>{
      console.error(`Error making call: ${error}`);
    });
});
```

Let's set up what happens when the user clicks the `Hang Up` button (`// ⌄⌄⌄ Hang up the call when the user clicks the Hang Up button ⌄⌄⌄`):
```js
hangUpButton.addEventListener("click", () => {
  console.log("Hanging up...");
  client.hangup(callId)
    .then(() => {
      hangUpButton.style.display = "none";
      callButton.style.display = "inline";
    })
    .catch(error => {
      console.error("Error hanging up call: ", error);
    });                
});
```

Here's the code for when the Outbound User clicks the `Login` button. It will get a token and create a Session (`// ⌄⌄⌄ Log in Outbound User ⌄⌄⌄`):
```js
document.getElementById("login-button-outbound").addEventListener("click", () => {
  const outboundDisplayName = document.getElementById("name-outbound").value;
  if (outboundDisplayName) {
    // Fetch the JWT token for the user from your server
    fetch(`/token?name=${outboundDisplayName}`)
    .then(response => response.json())
    .then(data => {
        token = data.token;
        client.createSession(token)
        .then(sessionId => {
            console.log("Id of created session: ", sessionId);
            document.getElementById("login-outbound").style.display = "none";
            document.getElementById("login-inbound").style.display = "block";
            document.querySelector("#logged-in-user").textContent = outboundDisplayName;
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

When the Outbound User "logs in" the Inbound User, a new window will open with the name of the Indbound User appended to the end of the Inbound URL (`// ⌄⌄⌄ Log in Inbound User ⌄⌄⌄`):
```js
document.getElementById("login-button-inbound").addEventListener("click", () => {
  inboundDisplayName = document.getElementById("name-inbound").value;
  if (inboundDisplayName) {
    inboundUsername = inboundDisplayName.toLowerCase().replaceAll(" ", "-");
    window.open(`/app-to-app-inbound.html?user=${inboundDisplayName}`, '_blank');
    document.getElementById("call-to-name").textContent = inboundDisplayName;
    document.getElementById("login-inbound").style.display = "none";
    callButton.style.display = "inline";
    document.getElementById("call-controls").style.display = "block";
  } else {
    alert("Please enter a username.");
  }
});
```

Let's now work on the Inbound User's side of the application.