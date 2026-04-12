import * as xb from 'xrblocks';


export class VonageAudioCall extends xb.Script {
    constructor() {
        super();
        this.token = '';
        this.client = new vonageClientSDK.VonageClient();
        this.callId = null;
        // Keep a reference to the panel so we can destroy it later
        this.panel = null; 
        this.statusText = null;
        this.userName = "XR_User_1";
        this.serverURL = null; // Set this to your server URL when initializing the script
        this.grid = null;
        this.controlRow = null;
        // this.preCallCtrlRow = null;
        // this.onCallCtrlRow = null;
    }

    init() {
        console.log("Vonage init!",this.client);
        this.setupVonageListeners();
        this.connectToVonage(this.userName);
    }

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

        // // 3. Controls
        // // pre-call
        // this.preCallCtrlRow = grid.addRow({ weight: 0.3 });

        // // Answer
        // const answerButton = this.preCallCtrlRow.addCol({ weight: 0.5 }).addIconButton({
        //     text: 'call',
        //     fontSize: 0.5,
        //     backgroundColor: '#00ff00'
        // });
        // answerButton.onTriggered = () => this._onAnswer();

        // // Reject
        // const rejectButton = this.preCallCtrlRow.addCol({ weight: 0.5 }).addIconButton({
        //     text: 'call_end',
        //     fontSize: 0.5,
        //     backgroundColor: '#ff0000'
        // });
        // rejectButton.onTriggered = () => this._onReject();

        // // this.panel.hide(preCallCtrlRow);
        // // this.remove(preCallCtrlRow);

        // //on-call
        // this.onCallCtrlRow = grid.addRow({ weight: 0 });
        // this.onCallCtrlRow.visible = false;

        // // Hangup
        // const hangupButton = this.onCallCtrlRow.addCol({ weight: 1 }).addIconButton({
        //     text: 'call_end',
        //     fontSize: 0.5,
        //     backgroundColor: '#ff0000'
        // });
        // hangupButton.onTriggered = () => this._onHangup();
        

        // // // Orbiter
        // // const orbiter = grid.addOrbiter();
        // // orbiter.addExitButton();
        // this.panel.updateLayouts();
    }

    // setCallState(state) {
    //     if (!this.panel) return;

    //     if (state === 'IN_CALL') {
    //         // Hide Pre-Call
    //         this.preCallCtrlRow.visible = false;
    //         this.preCallCtrlRow.weight = 0;

    //         // Show On-Call
    //         this.onCallCtrlRow.visible = true;
    //         this.onCallCtrlRow.weight = 0.3;

    //         console.log("this.onCallCtlRow: ",this.onCallCtrlRow)
            
    //     } else if (state === 'INCOMING') {
    //         // Show Pre-Call
    //         this.preCallCtrlRow.visible = true;
    //         this.preCallCtrlRow.weight = 0.3;

    //         // Hide On-Call
    //         this.onCallCtrlRow.visible = false;
    //         this.onCallCtrlRow.weight = 0;
    //     }

    //     // IMPORTANT: Tell the panel to recalculate sizes
    //     this.panel.updateLayouts();
    // }

    updateControlRow(state) {
        if (!this.grid) return;

        // 1. Remove the existing row if it exists
        if (this.controlRow) {
            // Depending on xb version, you might need this.controlRow.destroy() 
            // or removing it from grid children. 
            // Usually destroying the object is enough:
            // this.controlRow.destroy(); 
            // this.controlRow.remove();
            // console.log("this.controlRow: ", this.controlRow);
            this.grid.remove(this.controlRow);
            // if (this.controlRow.parent) this.controlRow.parent.remove(this.controlRow);
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

    removeCallPanel() {
        if (this.panel) {
            console.log("Destroying Call UI...");
            this.remove(this.panel);
            this.panel = null;
            this.grid = null;
            this.statusText = null;
            this.controlRow = null;
            // this.preCallCtrlRow = null;
            // this.onCallCtrlRow = null;
        }
    }

    setupVonageListeners() {
        // --- 1. CREATE UI ON INVITE ---
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

        // --- 2. REMOVE UI ON CANCEL/HANGUP ---
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

    _onAnswer() {
        console.log('Answering...');
        this.client.answer(this.callId)
        .then(() => {
          console.log("Success answering call.");
          this.statusText.text = `Call answered.`;
        //   this.setCallState('IN_CALL');
        this.updateControlRow('CONNECTED');
        })
        .catch(error => {
          console.error("Error answering call: ", error);
        });    
    }

    _onReject() {
        console.log('Rejecting...');
        // this.client.hangup(this.callId);
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

    _onHangup() {
        console.log('Hanging up...');
        // this.client.hangup(this.callId);
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

}