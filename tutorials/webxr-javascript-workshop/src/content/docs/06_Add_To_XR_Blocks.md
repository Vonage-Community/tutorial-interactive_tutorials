---
title: Add panels to XR Blocks
description: adding panels to WebXR application 
---

Let's add the 2 panels to the application.

The following code will be placed in the `main.js` file.

First, import the Panels:
`// ⌄⌄⌄ import Vonage Call Panel and Exit Button ⌄⌄⌄`
```js
import { VonageAudioCall } from './VonageAudioCall.js';
import { ExitPanel } from './ExitButton.js';
```

Create instances and add to the application:
`// ⌄⌄⌄ add Vonage Call Panel and Exit Button ⌄⌄⌄`
```js
xb.add(new VonageAudioCall());
xb.add(new ExitPanel());
```

## Time to test the application
Refresh the application and try to call the phone number that was purchased and assigned while running the setup script.

> Note: You can find the phone number connected to your Vonage application in the `.env` file.