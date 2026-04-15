---
title: Exiting WebXR application
description: Button to exit WebXR application 
---

When in the WebXR environment using a headset, I could not figure out how to leave the experience, so I made an Exit Demo Panel.

The following code will be placed in the `ExitButton.js` file.

Create the constructor for the Class:
`// ⌄⌄⌄ Create constructor ⌄⌄⌄`
```js
  constructor() {
    super();
    // Keep a reference to the panel so we can destroy it later
    this.panel = null; 
    this.statusText = null;
    this.exitPanelText = "Exit Demo";
  }
```

Function to create a panel for the Exit Button:
`// ⌄⌄⌄ Create Exit Button panel ⌄⌄⌄`
```js
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
```

Initialize Class when loaded into the page:
`// ⌄⌄⌄ Initialize ⌄⌄⌄`
```js
  init() {
    console.log("Exit Button init!",this.client);
    this.createExitPanel();
  }
```
