---
title: Vonage Call Panel
description: Create XR Blocks UI to answer phone calls 
---

Now, we'll be creating the UI.

To recieve phone calls via the Vonage Voice API using the XR Blocks library's <a href="https://xrblocks.github.io/docs/api/classes/SpatialPanel/" target="_blank">SpatialPanel Class</a>.

To show the 3D Avatar for the caller, we will use the <a href="https://xrblocks.github.io/docs/manual/Lipsync/" target="_blank">Lipsync (Addon)</a>.

The Vonage Voice Client SDK's <a href="https://developer.vonage.com/en/vonage-client-sdk/in-app-voice/guides/say-call" target="_blank">Text to Speech</a> will be used to send the quick replies and typed messages into the call.

The virtual keyboard that allows us to type those messages will come from the <a href="https://xrblocks.github.io/docs/manual/UI/#virtual-keyboard-addon" target="_blank">Virtual Keyboard (Addon)</a>.

The following code will be placed in the `static/VonageAudioCall.js` file.

First, we will set the Quick Replies that the user can send into the call.
Find `// ⌄⌄⌄ Set Quick Replies ⌄⌄⌄` and add this code:

```js
const QUICK_REPLIES = [
  { label: "Meeting", message: "In a meeting, I'll call you back." },
  { label: "Talk Later", message: "Can't talk right now. I'll talk later." },
  { label: "OMW!", message: "On my way! Talk soon." },
  { label: "5 Mins", message: "Call you back in 5 minutes." },
];
```

Let's initiate the constructor for our panel with some variables:
`// ⌄⌄⌄ Create constructor ⌄⌄⌄`

```js
constructor() {
  super();
  this.token = '';
  this.client = new vonageClientSDK.VonageClient();
  this.callId = null;
  // Keep a reference to the panel so we can destroy it later
  this.panel = null;
  this.statusText = null;
  this.userName = "XR_User_1";
  this.grid = null;
  this.controlRow = null;
  this.puppetHead = null;
  this.face = null;
  this.mouth = null;
  this._camWorld = new THREE.Vector3();
  this._headWorld = new THREE.Vector3();
  this.replyPanel = null;
  this.typedTextView = null;
  this._currentTypedText = '';
  this.keyboard = null;
}
```

Here's the function to create an Avatar and add the MediaStream for the LipSync feature: `// ⌄⌄⌄ Create 3D Avatar ⌄⌄⌄`

```js
_createAvatar(stream) {
  // Safety: don't create a second avatar if one already exists
  if (this.puppetHead) return;

  console.log("Creating lipsync avatar...");

  const faceR = 0.1;

  const head = new THREE.Group();
  // Position: in front of the user, roughly at face height
  head.position.set(0, xb.user.height, -1.2);

  // --- Sphere face mesh ---
  const faceGeom = new THREE.SphereGeometry(faceR, 32, 24);
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0xf2d4b3,
    roughness: 0.6,
    metalness: 0.05,
  });
  const faceMesh = new THREE.Mesh(faceGeom, faceMat);
  head.add(faceMesh);

  this.face = new xb.StylizedFace({ showEyes: true });
  head.add(this.face);

  this.mouth = new LipsyncMouth(stream, { target: this.face });
  head.add(this.mouth);

  this.puppetHead = head;
  this.add(head);
}
```

This function will remove the 3D Avatar when the call is over:
`// ⌄⌄⌄ Remove 3D Avatar ⌄⌄⌄`

```js
_removeAvatar() {
  if (!this.puppetHead) return;

  console.log("Removing lipsync avatar...");

  if (this.mouth) {
    // Detach from the head group before nulling the reference
    this.mouth.parent?.remove(this.mouth);
    this.mouth = null;
  }

  if (this.face) {
    this.face.parent?.remove(this.face);
    // dispose() frees the underlying canvas/texture to avoid memory leaks
    this.face.dispose();
    this.face = null;
  }

  this.remove(this.puppetHead);
  this.puppetHead = null;
}
```

Here's the function to create the panel:
`// ⌄⌄⌄ Create Call panel ⌄⌄⌄`

```js
_createCallPanel(callerName) {
  // SAFETY: If a panel already exists, don't create another one.
  if (this.panel) return;

  console.log("Creating Call UI...");

  // 1. Create the Panel
  this.panel = new xb.SpatialPanel({ backgroundColor: '#2b2b2baa' });
  this.panel.position.set(
    0,
    xb.user.height - 0.5,
    -xb.user.objectDistance
  );

  this.add(this.panel);

  this.grid = this.panel.addGrid();

  // 2. Status Text
  this.statusText = this.grid.addRow({ weight: 0.7 }).addText({
    text: `Incoming call from ${callerName}...`,
    fontColor: '#ffffff',
    fontSize: 0.08,
  });

  this.updateControlRow('INCOMING');
}
```

Function to update the call control section:
`// ⌄⌄⌄ Update Call controls ⌄⌄⌄`

```js
updateControlRow(state) {
  if (!this.grid) return;

  // 1. Remove the existing row if it exists
  if (this.controlRow) {
    this.grid.remove(this.controlRow);
    this.controlRow = null;
    this.grid.resetLayout();
  }

  // 2. Create a fresh row. It will naturally append below the Status Text.
  // We give it the full remaining weight (0.3 relative to the panel, or flexible)
  this.controlRow = this.grid.addRow({ weight: 0.3 });

  if (state === 'INCOMING') {
    // --- ANSWER BUTTON ---
    const answerBtn = this.controlRow.addCol({ weight: 0.5 }).addIconButton({
      text: 'call',
      fontSize: 0.5,
      backgroundColor: '#00ff00'
    });
    answerBtn.onTriggered = () => this._onAnswer();

    // --- REJECT BUTTON ---
    const rejectBtn = this.controlRow.addCol({ weight: 0.5 }).addIconButton({
      text: 'call_end',
      fontSize: 0.5,
      backgroundColor: '#ff0000'
    });
    rejectBtn.onTriggered = () => this._onReject();

  } else if (state === 'CONNECTED') {
    // --- HANGUP BUTTON ---
    // This is a fresh row, so layouts will calculate correctly
    const hangupBtn = this.controlRow.addCol({ weight: 1 }).addIconButton({
      text: 'call_end',
      fontSize: 0.5,
      backgroundColor: '#ff0000'
    });
    hangupBtn.onTriggered = () => this._onHangup();
  }

  // 3. Force layout update
  this.panel.updateLayouts();
}
```

This function will remove the panel once the call is over:
`// ⌄⌄⌄ Remove Call panel ⌄⌄⌄`

```js
_removeCallPanel() {
  if (this.panel) {
    console.log("Destroying Call UI...");
    this.remove(this.panel);
    this.panel = null;
    this.grid = null;
    this.statusText = null;
    this.controlRow = null;
  }
  this._removeReplyPanel();
}
```

Now, let's add the Virtual Keyboard that will allow us to send text messages that will be spoken into the call.

Here's the code to show the Keyboard:
`// ⌄⌄⌄ Show Virtual Keyboard ⌄⌄⌄`

```js
_showKeyboard() {
  if (this.keyboard) return;

  this.keyboard = new Keyboard();
  // Position it below and aligned with the reply panel
  this.keyboard.position.set(
    0,
    xb.user.height - 1.35,
    -xb.user.objectDistance + 1
  );
  this.add(this.keyboard);

  // Update the display on every keystroke
  this.keyboard.onTextChanged = (text) => {
    this._currentTypedText = text;
    if (this.typedTextView) {
      this.typedTextView.text = text.length > 0 ? text : 'Tap  to type...';
    }
  };

  // Enter key sends immediately — same as tapping the Send button
  this.keyboard.onEnterPressed = (text) => {
    this._sendTypedText();
  };
}
```

If we want to hide the Keyboard, here's the code:
`// ⌄⌄⌄ Hide Virtual Keyboard ⌄⌄⌄`

```js
_hideKeyboard() {
  if (!this.keyboard) return;
  this.remove(this.keyboard);
  this.keyboard = null;
}
```

To toggle between showing and hidding the keyboard, we have this code:
`// ⌄⌄⌄ Toggle Virtual Keyboard ⌄⌄⌄`

```js
_toggleKeyboard() {
  this.keyboard ? this._hideKeyboard() : this._showKeyboard();
}
```

Let's create the functions that will send the text to be said into the call just in case we can't talk at that moment.

To send the Quick Replies that we set before:
`// ⌄⌄⌄ Send Quick Reply ⌄⌄⌄`

```js
_sendQuickReply(message) {
  if (!this.callId) return;
  console.log(`Sending quick reply: "${message}"`);

  // Give the user immediate visual feedback in the status bar
  if (this.statusText) this.statusText.text = 'Sending...';

  this.client.say(this.callId, message)
    .then(() => {
      console.log('Quick reply sent successfully.');
      if (this.statusText) this.statusText.text = `Sent: "${message}"`;
    })
    .catch(err => {
      console.error('say() error:', err);
      if (this.statusText) this.statusText.text = 'Failed to send message.';
    });
}
```

In the case we want to carry on the conversation but maybe can't speak (ie in a public space), we can send custom text:
`// ⌄⌄⌄ Send Custom Text ⌄⌄⌄`

```js
_sendTypedText() {
  const text = this._currentTypedText.trim();
  if (!text) return;
  if (!this.callId) return;

  console.log(`Sending typed text: "${text}"`);
  if (this.statusText) this.statusText.text = 'Sending...';

  this.client.say(this.callId, text)
    .then(() => {
      console.log('Typed text sent successfully.');
      if (this.statusText) this.statusText.text = `Sent: "${text}"`;

      // Clear the keyboard buffer and reset the display
      if (this.keyboard) this.keyboard.setText('');
      this._currentTypedText = '';
      if (this.typedTextView) this.typedTextView.text = 'Tap  to type...';
    })
    .catch(err => {
      console.error('say() error:', err);
      if (this.statusText) this.statusText.text = 'Failed to send message.';
    });
}
```

Here we will create the Reply panel that will hold all the way we can send a text message into the call:
`// ⌄⌄⌄ Create Reply panel ⌄⌄⌄`

```js
_createReplyPanel() {
  if (this.replyPanel) return;

  this.replyPanel = new xb.SpatialPanel({
    backgroundColor: '#1a1a2ecc',
    width: .75,
    height: 0.9,
  });
  // Offset to the right so it sits beside the main call panel
  this.replyPanel.position.set(
    0.8,
    xb.user.height - 0.5,
    -xb.user.objectDistance
  );
  this.add(this.replyPanel);

  const grid = this.replyPanel.addGrid();

  grid.addRow({ weight: 0.06 }).addText({
    text: 'Quick Replies',
    fontColor: '#9b9bff',
    fontSize: 0.055,
  });

  const pairs = [
    QUICK_REPLIES.slice(0, 2),   // [ Meeting, Talk Later ]
    QUICK_REPLIES.slice(2, 4),   // [ OMW!, 5 Mins ]
  ];

  pairs.forEach(pair => {
    const row = grid.addRow({ weight: 0.20 });
    pair.forEach(({ label, message }) => {
      const btn = row.addCol({ weight: 0.5 }).addTextButton({
        text: label,
        fontSize: 0.35,
        backgroundColor: '#2e2e50',
        fontColor: '#ffffff',
      });
      btn.onTriggered = () => this._sendQuickReply(message);
    });
  });

  grid.addRow({ weight: 0.06 }).addText({
    text: 'Talk via Text',
    fontColor: '#9b9bff',
    fontSize: 0.055,
  });

  this.typedTextView = grid.addRow({ weight: 0.18 }).addText({
    text: 'Tap to type...',
    fontColor: '#ffffff',
    fontSize: 0.065,
    textAlign: 'left',
  });

  const actionRow = grid.addRow({ weight: 0.30 });

  const kbBtn = actionRow.addCol({ weight: 0.5 }).addIconButton({
    text: 'keyboard',
    fontSize: 0.5,
    backgroundColor: '#2e3a4a',
  });
  kbBtn.onTriggered = () => this._toggleKeyboard();

  const sendBtn = actionRow.addCol({ weight: 0.5 }).addIconButton({
    text: 'send',
    fontSize: 0.5,
    backgroundColor: '#1a4a2a',
  });
  sendBtn.onTriggered = () => this._sendTypedText();

  this.replyPanel.updateLayouts();
}
```

Just like with the Call panel, we will have a function to remove the Reply panel:
`// ⌄⌄⌄ Remove Reply panel ⌄⌄⌄`

```js
_removeReplyPanel() {
  this._hideKeyboard();
  if (this.replyPanel) {
    this.remove(this.replyPanel);
    this.replyPanel = null;
    this.typedTextView = null;
  }
  this._currentTypedText = '';
}
```

This function answers the call and updates the status and call control section:
`// ⌄⌄⌄ Answer call method ⌄⌄⌄`

```js
_onAnswer() {
  console.log('Answering...');
  this.client.answer(this.callId)
    .then(() => {
      console.log("Success answering call.");
      this.statusText.text = `Call answered.`;
      this.updateControlRow('CONNECTED');

      // ⌄⌄⌄ Show reply panel alongside the call panel ⌄⌄⌄
      this._createReplyPanel();

      // get media stream
      const audioElement = this.client.getAudioOutputElement();
      if (audioElement && audioElement.srcObject) {
        // This is the active WebRTC MediaStream managed by Vonage
        const remoteStream = audioElement.srcObject;
        console.log('remoteStream: ', remoteStream);

        // Example: Grab individual audio tracks from the stream
        const audioTracks = remoteStream.getAudioTracks();
        console.log("Active Audio Tracks:", audioTracks);

        // ⌄⌄⌄ Spin up the lipsync avatar driven by the remote stream ⌄⌄⌄
        this._createAvatar(remoteStream);
      }
    })
    .catch(error => {
      console.error("Error answering call: ", error);
    });
}
```

This function will reject the incoming call and remove the panel:
`// ⌄⌄⌄ Reject call method ⌄⌄⌄`

```js
_onReject() {
  console.log('Rejecting...');
  this.client.reject(this.callId)
    .then(() => {
      console.log("Success rejecting call.");
    })
    .catch(error => {
      console.error("Error rejecting call: ", error);
    });
  this._removeCallPanel();
  this._removeAvatar();
}
```

This function will hang up the ongoing call and remove the panel:
`// ⌄⌄⌄ Hang Up call method ⌄⌄⌄ `

```js
_onHangup() {
  console.log('Hanging up...');
  this.client.hangup(this.callId)
    .then(() => {
      console.log("Success hanging up call.");
    })
    .catch(error => {
      console.error("Error hanging up call: ", error);
    });
  // We manually destroy the panel here too, just in case the event lags
  this._removeCallPanel();
  this._removeAvatar();
}
```

Set up some listeners for the events that the Vonage Client SDK will emit and what to do:
`// ⌄⌄⌄ Set Up Vonage Listeners ⌄⌄⌄`

```js
setupVonageListeners() {
  // --- CREATE UI ON INVITE ---
  this.client.on('callInvite', (callId, from, channelType) => {
    this.callId = callId;
    const maskedNumber = from.replace(/\d(?=(?:\D*\d){4})/g, "*")
    console.log(`Incoming call from ${maskedNumber}`);

    // Trigger the UI creation here
    this._createCallPanel(maskedNumber);
  });

  this.client.on('legStatusUpdate', (callId, legId, status) => {
    console.log("status: ", status);
    if (this.statusText) {
      this.statusText.text = `Status: ${status}`;
    }
  });

  // --- REMOVE UI ON CANCEL/HANGUP ---
  this.client.on('callInviteCancel', (callId) => {
    console.log(`Call cancelled: ${callId}`);
    this.callId = null;
    this._removeCallPanel();
    this._removeAvatar();
  });

  this.client.on("callHangup", (callId, callQuality, reason) => {
    console.log(`Call hung up: ${reason}`);
    this.callId = null;
    this._removeCallPanel();
    this._removeAvatar();
  });
}
```

Get a token from the server so you can connect to a session:
`// ⌄⌄⌄ Connect to server to get token ⌄⌄⌄ `

```js
async connectToVonage(name) {
  try {
    console.log(`Fetching token for ${name}...`);

    // 1. Fetch the token (AWAIT the result)
    const response = await fetch(`/token?name=${name}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    this.token = data.token;
    console.log("Fetched token successfully.");

    // 2. Create the Session (AWAIT the result)
    const sessionId = await this.client.createSession(this.token);

    console.log("Session created successfully. Session ID:", sessionId);

    // 3. Update UI
    // Instead, update your XR Panel text to show we are ready
    if(this.statusText) {
      this.statusText.text = "Connected. Waiting for calls...";
    }

  } catch (error) {
    console.error("Connection failed:", error);
    if(this.statusText) this.statusText.text = "Connection Failed.";
  }
}
```

Initialize the Class when loaded into the page:
`// ⌄⌄⌄ Initialize ⌄⌄⌄`

```js
init() {
  console.log("Vonage init!",this.client);
  this.setupVonageListeners();
  this.connectToVonage(this.userName);
}
```
