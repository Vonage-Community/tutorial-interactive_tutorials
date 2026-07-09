---
title: Add the Call Menu
description: Write the mainMenu function that builds the NCCO call menu.
---

# Add the Call Menu

The `mainMenu` function builds the NCCO that plays the greeting and collects a keypress. You are wrapping it in a function so it can be called from both the answer webhook and the DTMF webhook (to repeat the menu).

In `project/index.js`, find the comment:

```
// TODO: Add the mainMenu function
```

Replace it with:

```js
function mainMenu() {
  return [
    {
      action: 'talk',
      bargeIn: true,
      text: 'Welcome. Press 1 to hear the current date. Press any other key to hear these options again.',
    },
    {
      action: 'input',
      type: ['dtmf'],
      dtmf: {
        maxDigits: 1,
      },
      eventUrl: [`${BASE_URL}/webhooks/dtmf`],
      eventMethod: 'POST',
    },
  ];
}
```

The NCCO contains two actions:

- **`talk`** — reads the menu prompt aloud. `bargeIn: true` lets the caller interrupt the speech by pressing a key.
- **`input`** — waits for a single DTMF keypress and sends it to `/webhooks/dtmf`.
