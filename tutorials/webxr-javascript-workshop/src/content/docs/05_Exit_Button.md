---
title: Exiting WebXR application
description: Button to exit WebXR application 
---

When in the WebXR environment using a headset, I could not figure out how to leave the experience, so I made an Exit Demo Panel.

The following code will be placed in the `static/ExitButton.js` file.

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

  console.log('Creating Exit Button...');

  // 1. Status Text (uses Yoga pixel units for fontSize instead of 0.0-1.0 ratios)
  this.statusText = new xb.UIText({
    text: this.exitPanelText,
    style: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
    },
  });

  // 2. Explicitly wired UIButton with the required log message
  this.exitButton = new xb.UIButton({
    label: 'Exit',
    onClick: () => {
      console.log('ExitButton triggered: Shutting down XR session.');
      
      const renderer = xb.core?.renderer;
      const session = renderer?.xr?.getSession?.();
      
      if (session) {
        session.end();
      } else {
        // Fallback behavior if testing in the desktop simulator without an active XR session
        console.log('No active XR session found. Resetting or closing demo...');
      }
    },
  });

  if (this.exitButton.xb) {
    this.exitButton.xb.pointerEvents = true;
    this.exitButton.xb.interactionEnabled = true;
  }

  // 3. Create the world-space UICard (replaces SpatialPanel + Grid)
  this.panel = new xb.UICard({
    theme: 'grayGlass',
    manipulation: true,
    edge: true,
    style: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
    },
    children: [this.statusText, this.exitButton],
  });

  this.panel.position.set(0, xb.user.height - 0.5, 1.0);
  this.panel.rotation.set(0, Math.PI, 0);

  this.add(this.panel);
}
```

Initialize Class when loaded into the page:
`// ⌄⌄⌄ Initialize ⌄⌄⌄`
```js
init() {
  console.log("Exit Button init!");
  this.createExitPanel();
}
```
