---
title: Vonage Call Panel
description: Create XR Blocks UI to answer phone calls 
---

Now, we'll be creating the UI.

To recieve phone calls via the Vonage Voice API using the XR Blocks library's <a href="https://xrblocks.github.io/docs/manual/UI/" target="_blank">Spatial UI</a>.

To show the 3D Avatar for the caller, we will use the <a href="https://xrblocks.github.io/docs/manual/Lipsync/" target="_blank">Lipsync (Addon)</a>.

The Vonage Voice Client SDK's <a href="https://developer.vonage.com/en/vonage-client-sdk/in-app-voice/guides/say-call" target="_blank">Text to Speech</a> will be used to send the quick replies and typed messages into the call.

The virtual keyboard that allows us to type those messages will come from the <a href="https://xrblocks.github.io/docs/manual/UI/#scrolling-and-editable-text" target="_blank">Virtual Keyboard (Addon)</a>.

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
  this.userName = 'XR_User_1';

  // Call UI references
  this.panel = null;
  this.statusText = null;
  this.controlRow = null;

  // Avatar & Lipsync references
  this.puppetHead = null;
  this.face = null;
  this.mouth = null;
  this._camWorld = new THREE.Vector3();
  this._headWorld = new THREE.Vector3();

  // Reply UI & Keyboard references
  this.replyPanel = null;
  this.typedTextView = null;
  this._currentTypedText = '';
  this.keyboard = null;
  this.keyboardCard = null;
}
```

Here's the function to create an Avatar and add the MediaStream for the LipSync feature: `// ⌄⌄⌄ Create 3D Avatar ⌄⌄⌄`

```js
_createAvatar(stream) {
  // Safety: don't create a second avatar if one already exists
  if (this.puppetHead) return;

  console.log('Creating lipsync avatar...');

  const faceR = 0.1; // 0.1 m radius — matches xb.StylizedFace's default expectations
  const userHeight = xb.user?.height ?? 1.6;

  const head = new THREE.Group();
  // Position: in front of the user, roughly at face height
  head.position.set(0, userHeight, -1.2);

  // Sphere face mesh
  const faceGeom = new THREE.SphereGeometry(faceR, 32, 24);
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0xf2d4b3,
    roughness: 0.6,
    metalness: 0.05,
  });
  const faceMesh = new THREE.Mesh(faceGeom, faceMat);
  head.add(faceMesh);

  // StylizedFace renders dynamic blinking eyes and mouth decals on the -Z face
  this.face = new xb.StylizedFace({ showEyes: true });
  head.add(this.face);

  // LipsyncMouth analyses the remote WebRTC MediaStream and drives StylizedFace
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

  console.log('Removing lipsync avatar...');

  if (this.mouth) {
    // Clean up Web Audio analyser resources if exposed by the addon
    // dispose() frees the underlying canvas/texture to avoid memory leaks
    this.mouth.dispose?.();
    this.mouth.parent?.remove(this.mouth);
    this.mouth = null;
  }

  if (this.face) {
    this.face.parent?.remove(this.face);
    this.face.dispose?.();
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

  console.log('Creating Call UI...');

  const userHeight = xb.user?.height ?? 1.6;
  const objDist = xb.user?.objectDistance ?? 1.2;

  this.statusText = new xb.UIText({
    text: `Incoming call from ${callerName}...`,
    style: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
    },
  });

  this.controlRow = new xb.UIPanel({
    style: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      width: '100%',
    },
  });

  this.panel = new xb.UICard({
    size: { width: 0.48, height: 'auto' },
    theme: 'grayGlass',
    manipulation: true,
    edge: { scale: true },
    style: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 20,
      backgroundColor: 'rgba(43, 43, 43, 0.85)',
      borderRadius: 24,
    },
    children: [this.statusText, this.controlRow],
  });

  this.panel.position.set(0, userHeight - 0.35, -objDist);
  this.add(this.panel);

  this.updateControlRow('INCOMING');
}
```

Function to update the call control section:
`// ⌄⌄⌄ Update Call controls ⌄⌄⌄`

```js
updateControlRow(state) {
  if (!this.controlRow) return;

  // Clear existing buttons from the flex row
  while (this.controlRow.children.length > 0) {
    this.controlRow.remove(this.controlRow.children[0]);
  }

  if (state === 'INCOMING') {
    const answerBtn = new xb.UIButton({
      label: 'Answer',
      icon: 'call',
      style: {
        backgroundColor: '#1b873f',
        color: '#ffffff',
      },
      onClick: (e) => {
        e?.stopPropagation?.(); // event.stopPropagation()` to stop bubbling
        this._onAnswer();
      },
    });

    const rejectBtn = new xb.UIButton({
      label: 'Decline',
      icon: 'call_end',
      style: {
        backgroundColor: '#c92a2a',
        color: '#ffffff',
      },
      onClick: (e) => {
        e?.stopPropagation?.();
        this._onReject();
      },
    });

    this.controlRow.add(answerBtn, rejectBtn);
  } else if (state === 'CONNECTED') {
    const hangupBtn = new xb.UIButton({
      label: 'Hang Up',
      icon: 'call_end',
      style: {
        backgroundColor: '#c92a2a',
        color: '#ffffff',
      },
      onClick: (e) => {
        e?.stopPropagation?.();
        this._onHangup();
      },
    });

    this.controlRow.add(hangupBtn);
  }
}
```

This function will remove the panel once the call is over:
`// ⌄⌄⌄ Remove Call panel ⌄⌄⌄`

```js
_removeCallPanel() {
  if (this.panel) {
    console.log('Destroying Call UI...');
    this.remove(this.panel);
    this.panel = null;
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
  if (this.keyboardCard) return;

  const userHeight = xb.user?.height ?? 1.6;
  const objDist = xb.user?.objectDistance ?? 1.2;

  this.keyboard = new Keyboard({
    value: this._currentTypedText ?? '',
    onValueChange: (value) => {
      this._currentTypedText = value;
      if (this.typedTextView) {
        console.log("Typed text changed: ", value);
        this.typedTextView.text = value.length > 0 ? value : 'Tap to type...';
      }
    },
    onSubmit: (value) => {
      this._sendTypedText();
    },
  });

  // Wrap the Keyboard UIElement inside a world-space UICard root
  this.keyboardCard = new xb.UICard({
    size: { width: 0.75, height: 'auto' },
    theme: 'grayGlass',
    manipulation: true,
    edge: { scale: true },
    style: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
      backgroundColor: 'rgba(20, 20, 35, 0.92)',
      borderRadius: 20,
    },
    children: [this.keyboard],
  });

  // Position and tilt the UICard root in 3D space
  this.keyboardCard.position.set(0.25, userHeight - 0.68, -objDist + 0.25);
  this.keyboardCard.rotation.x = -0.35;
  this.add(this.keyboardCard);

  this.keyboard.onTextChanged = (text) => {
    this._currentTypedText = text;
    if (this.typedTextView) {
      console.log("Typed text changed: ", text);
      this.typedTextView.text = text.length > 0 ? text : 'Tap to type...';
    }
  };

  this.keyboard.onEnterPressed = () => {
    this._sendTypedText();
  };
}
```

If we want to hide the Keyboard, here's the code:
`// ⌄⌄⌄ Hide Virtual Keyboard ⌄⌄⌄`

```js
_hideKeyboard() {
  if (!this.keyboardCard) return;
  this.remove(this.keyboardCard);
  this.keyboardCard = null;
  this.keyboard = null;
}
```

To toggle between showing and hidding the keyboard, we have this code:
`// ⌄⌄⌄ Toggle Virtual Keyboard ⌄⌄⌄`

```js
_toggleKeyboard() {
  this.keyboardCard ? this._hideKeyboard() : this._showKeyboard();
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

  this.client
    .say(this.callId, message)
    .then(() => {
      console.log('Quick reply sent successfully.');
      if (this.statusText) this.statusText.text = `Sent: "${message}"`;
    })
    .catch((err) => {
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
  if (!text || !this.callId) return;

  console.log(`Sending typed text: "${text}"`);
  if (this.statusText) this.statusText.text = 'Sending...';

  this.client
    .say(this.callId, text)
    .then(() => {
      console.log('Typed text sent successfully.');
      if (this.statusText) this.statusText.text = `Sent: "${text}"`;

      // Clear the keyboard buffer and reset the display
      if (this.keyboard) this.keyboard.setValue('');
      this._currentTypedText = '';
      if (this.typedTextView) this.typedTextView.text = 'Tap to type...';
    })
    .catch((err) => {
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

  const userHeight = xb.user?.height ?? 1.6;
  const objDist = xb.user?.objectDistance ?? 1.2;

  // 1. Quick Replies Header
  const quickRepliesHeader = new xb.UIText({
    text: 'Quick Replies',
    style: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#9b9bff',
    },
  });

  // 2. Quick Reply Button Rows (2x2 layout)
  const pairs = [
    QUICK_REPLIES.slice(0, 2),
    QUICK_REPLIES.slice(2, 4),
  ];

  const quickReplyRows = pairs.map((pair) => {
    const buttons = pair.map(
      ({ label, message }) =>
        new xb.UIButton({
          label,
          style: {
            backgroundColor: '#2e2e50',
            color: '#ffffff',
            flexGrow: 1,
          },
          onClick: (e) => {
            e?.stopPropagation?.();
            this._sendQuickReply(message);
          },
        })
    );

    return new xb.UIPanel({
      style: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        width: '100%',
      },
      children: buttons,
    });
  });

  // 3. Talk via Text Header
  const talkHeader = new xb.UIText({
    text: 'Talk via Text',
    style: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#9b9bff',
      marginTop: 8,
    },
  });

  // 4. Typed Text Display Box
  this.typedTextView = new xb.UIText({
    text: 'Tap to type...',
    style: {
      fontSize: 18,
      color: '#ffffff',
      textAlign: 'left',
    },
  });

  const textDisplayBox = new xb.UIPanel({
    style: {
      width: '100%',
      padding: 14,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      borderRadius: 12,
    },
    children: [this.typedTextView],
  });

  // 5. Keyboard Toggle + Send Action Row
  const kbBtn = new xb.UIButton({
    label: 'Keyboard',
    icon: 'keyboard',
    style: {
      backgroundColor: '#2e3a4a',
      color: '#ffffff',
      flexGrow: 1,
    },
    onClick: (e) => {
      e?.stopPropagation?.();
      this._toggleKeyboard();
    },
  });

  const sendBtn = new xb.UIButton({
    label: 'Send',
    icon: 'send',
    style: {
      backgroundColor: '#1a4a2a',
      color: '#ffffff',
      flexGrow: 1,
    },
    onClick: (e) => {
      e?.stopPropagation?.();
      this._sendTypedText();
    },
  });

  const actionRow = new xb.UIPanel({
    style: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      width: '100%',
    },
    children: [kbBtn, sendBtn],
  });

  // 6. Assemble Reply UICard
  this.replyPanel = new xb.UICard({
    size: { width: 0.55, height: 'auto' },
    theme: 'grayGlass',
    manipulation: true,
    edge: { scale: true },
    style: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: 24,
      gap: 14,
      backgroundColor: 'rgba(26, 26, 46, 0.88)',
      borderRadius: 24,
    },
    children: [
      quickRepliesHeader,
      ...quickReplyRows,
      talkHeader,
      textDisplayBox,
      actionRow,
    ],
  });

  // Offset to the right of the main call panel and angled slightly inward
  this.replyPanel.position.set(0.58, userHeight - 0.35, -objDist);
  this.replyPanel.rotation.y = -0.2;
  this.add(this.replyPanel);
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
  this.client
    .answer(this.callId)
    .then(() => {
      console.log('Success answering call.');
      if (this.statusText) this.statusText.text = 'Call answered.';
      this.updateControlRow('CONNECTED');
      // ⌄⌄⌄ Show reply panel alongside the call panel ⌄⌄⌄
      this._createReplyPanel();

      // get media stream
      const audioElement = this.client.getAudioOutputElement();
      if (audioElement && audioElement.srcObject) {
        // This is the active WebRTC MediaStream managed by Vonage
        const remoteStream = audioElement.srcObject;
        this._createAvatar(remoteStream);
      }
    })
    .catch((error) => {
      console.error('Error answering call: ', error);
    });
}
```

This function will reject the incoming call and remove the panel:
`// ⌄⌄⌄ Reject call method ⌄⌄⌄`

```js
_onReject() {
  console.log('Rejecting...');
  this.client
    .reject(this.callId)
    .then(() => console.log('Success rejecting call.'))
    .catch((error) => console.error('Error rejecting call: ', error));

  this._removeCallPanel();
  this._removeAvatar();
}
```

This function will hang up the ongoing call and remove the panel:
`// ⌄⌄⌄ Hang Up call method ⌄⌄⌄ `

```js
_onHangup() {
  console.log('Hanging up...');
  this.client
    .hangup(this.callId)
    .then(() => console.log('Success hanging up call.'))
    .catch((error) => console.error('Error hanging up call: ', error));

  this._removeCallPanel();
  this._removeAvatar();
}
```

Set up some listeners for the events that the Vonage Client SDK will emit and what to do:
`// ⌄⌄⌄ Set Up Vonage Listeners ⌄⌄⌄`

```js
setupVonageListeners() {
  // --- CREATE UI ON INVITE ---
  this.client.on('callInvite', (callId, from) => {
    this.callId = callId;
    const maskedNumber = from.replace(/\d(?=(?:\D*\d){4})/g, '*');
    console.log(`Incoming call from ${maskedNumber}`);

    // Trigger the UI creation here
    this._createCallPanel(maskedNumber);
  });

  this.client.on('legStatusUpdate', (callId, legId, status) => {
    console.log('status: ', status);
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

  this.client.on('callHangup', (callId, callQuality, reason) => {
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
    console.log('Fetched token successfully.');

    // 2. Create the Session (AWAIT the result)
    const sessionId = await this.client.createSession(this.token);
    console.log('Session created successfully. Session ID:', sessionId);

    // 3. Update UI
    // Update your XR Panel text to show we are ready
    if (this.statusText) {
      this.statusText.text = 'Connected. Waiting for calls...';
    }
  } catch (error) {
    console.error('Connection failed:', error);
    if (this.statusText) this.statusText.text = 'Connection Failed.';
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
