---
title: Vonage Call Panel
description: Create XR Blocks UI to answer phone calls 
---

We'll be creating the UI to recieve phone calls via the Vonage Voice API using the XR Blocks library.

The following code will be placed in the `VonageAudioCall.js` file.

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
  }
```

`// ⌄⌄⌄ Create call panel ⌄⌄⌄`
```js
  createCallPanel(callerName) {
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

`// ⌄⌄⌄ Update call controls ⌄⌄⌄`
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

`// ⌄⌄⌄ Remove call panel ⌄⌄⌄`
```js
  removeCallPanel() {
    if (this.panel) {
      console.log("Destroying Call UI...");
      this.remove(this.panel);
      this.panel = null;
      this.grid = null;
      this.statusText = null;
      this.controlRow = null;
    }
  }
```

`// ⌄⌄⌄ Answer call method ⌄⌄⌄`
```js
  _onAnswer() {
    console.log('Answering...');
    this.client.answer(this.callId)
    .then(() => {
      console.log("Success answering call.");
      this.statusText.text = `Call answered.`;
      this.updateControlRow('CONNECTED');
    })
    .catch(error => {
      console.error("Error answering call: ", error);
    });    
  }
```

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
    // We manually destroy the panel here too, just in case the event lags
    this.removeCallPanel(); 
  }

```

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
    this.removeCallPanel(); 
  }

```

`// ⌄⌄⌄ Set Up Vonage Listeners ⌄⌄⌄`
```js
  setupVonageListeners() {
    // --- CREATE UI ON INVITE ---
    this.client.on('callInvite', (callId, from, channelType) => {
      this.callId = callId;
      console.log(`Incoming call from ${from}`);
      
      // Trigger the UI creation here
      this.createCallPanel(from);
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
      this.removeCallPanel();
    });

    this.client.on("callHangup", (callId, callQuality, reason) => {
      console.log(`Call hung up: ${reason}`);
      this.callId = null;
      this.removeCallPanel();
    });
  }


```

`// ⌄⌄⌄ Connect to server to get token ⌄⌄⌄ `
```js
  async connectToVonage(name) {
    try {
      console.log(`Fetching token for ${name}...`);

      // 1. Fetch the token (AWAIT the result)
      // const response = await fetch(`${this.serverURL}/token?name=${name}`);
      const response = await fetch(`/token?name=${name}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.token = data.token;
      console.log("Fetched token successfully.");

      // 2. Create the Session (AWAIT the result)
      // Ensure you reference 'this.client', not 'client'
      const sessionId = await this.client.createSession(this.token);
      
      console.log("Session created successfully. Session ID:", sessionId);

      // 3. Update UI
      // Instead, update your XR Panel text to show we are ready
      if(this.statusText) {
        this.statusText.text = "Connected. Waiting for calls...";
      }

    } catch (error) {
      console.error("Connection failed:", error);
      // Optional: Update XR text to show error
      if(this.statusText) this.statusText.text = "Connection Failed.";
    }
  }

```

`// ⌄⌄⌄ Initialize ⌄⌄⌄`
```js
  init() {
    console.log("Vonage init!",this.client);
    this.setupVonageListeners();
    this.connectToVonage(this.userName);
  }

```
