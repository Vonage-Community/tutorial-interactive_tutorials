---
title: Add JavaScript
description: Get making video calls working.
---

Next, let's add some functionality to the application.

The following code snippets will be added to the `app.js` file in the `js` folder.

Initialize a `streamId` and get references to the archive layout UI elements (`// ⌄⌄⌄ set a variable to hold the streamId and get references to archive UI ⌄⌄⌄`):

```js
let streamId;
const layoutSelect = document.querySelector('#layout-select');
const currentLayout = document.querySelector('#current-layout');
```

In the `session.connect` method, set the `streamId` to `publisher.streamId` when the connection is successful. (`// ⌄⌄⌄ set streamId to publisher.streamId ⌄⌄⌄`):

```js
streamId = publisher.streamId;
```

Add a change event listener to the `layoutSelect` element that will set the text and value for the selected layout. Then assign a `classList` based on the layout selected. Then a `POST` request will be made to the `updateLayout` endpoint.  (`// ⌄⌄⌄ add listener for a change event in the layout select element ⌄⌄⌄`):

```js
layoutSelect.addEventListener('change', async (event) => {
  if (!archive) {
    alert('Please start an archive first.');
    return;
  }
  const selectedText = event.target.selectedOptions[0].text;
  const selectedLayout = event.target.value;
  let layout = {
    type: selectedLayout
  };
  let classList;
  if (['horizontalPresentation', 'verticalPresentation'].includes(selectedLayout)) {
    classList = ['focus']
  } else {
    classList = ['full']
  }
  if (selectedLayout === 'custom') {
    layout.stylesheet = "stream.instructor {position: absolute;  width: 100%;  height:50%;}"
    classList = ['instructor']
  }
  // Make POST call to /updateLayout endpoint with archive.id, selectedLayout and classList
  try {
    console.log('streamId: ', streamId);
    layoutResult = await postData(`/archive/${archive.id}/updateLayout`, { layout, sessionId, streamId, classList });
    currentLayout.innerText = selectedText;
  }
  catch (error) {
    handleError(error);
  }
});
```
