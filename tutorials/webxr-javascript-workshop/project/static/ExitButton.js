import * as xb from 'xrblocks';


export class ExitPanel extends xb.Script {
    constructor() {
        super();
        // Keep a reference to the panel so we can destroy it later
        this.panel = null; 
        this.statusText = null;
        this.exitPanelText = "Exit Demo";
    }

    init() {
        console.log("Exit Button init!",this.client);
        this.createExitPanel();
    }

    createExitPanel() {
        // SAFETY: If a panel already exists, don't create another one.
        if (this.panel) return;

        console.log("Creating Exit Button...");
        
        // 1. Create the Panel
        this.panel = new xb.SpatialPanel({
            width: 0.5,
            height: 0.5, 
            backgroundColor: '#2b2b2baa'
        });
        this.panel.position.set(
            0,
            xb.user.height,
            2.0
        );
        this.panel.rotation.set(0, Math.PI, 0);
        this.add(this.panel);

        const grid = this.panel.addGrid();

        // 2. Status Text
        this.statusText = grid.addRow({ weight: 1 }).addText({
            text: this.exitPanelText,
            fontColor: '#ffffff',
            fontSize: .4,
        });

        // Orbiter
        const orbiter = grid.addOrbiter();
        orbiter.addExitButton();
        this.panel.updateLayouts();
    }


}