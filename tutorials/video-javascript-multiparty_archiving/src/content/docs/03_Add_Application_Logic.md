---
title: Add JavaScript
description: Get making video calls working.
---

Next, let's add some functionality to the application.

The following code snippets will be added to the `app.js` file in the `js` folder.


Initialize an `archive` and get references to the archive UI elements and set the display of the stop button to none:

```js
let archive;
const archiveStartBtn = document.querySelector('#start');
const archiveStopBtn = document.querySelector('#stop');
const archiveLinkSpan = document.querySelector('#archiveLink');

archiveStopBtn.style.display = "none";
```

In the `initializeSession()` function, add an event listener to the session for `archiveStarted` that will set the `archive` variable to the current archive object, update the displays of the buttons and clear the archive link's space:

```js
session.on('archiveStarted', (event) => {
  archive = event;
  console.log('Archive started ' + archive.id);
  archiveStartBtn.style.display = 'none';
  archiveStopBtn.style.display = 'inline';
  archiveLinkSpan.innerHTML = '';
});
```

Next, add an event listener to the session for when the archive is stopped (`archiveStopped`) that will update the buttons' displays and insert a link to view the recording:

```js
session.on('archiveStopped', (event) => {
  archive = event;
  console.log('Archive stopped ' + archive.id);
  archiveStartBtn.style.display = 'inline';
  archiveStopBtn.style.display = 'none';
  archiveLinkSpan.innerHTML = `<a href="/archive/${archive.id}/view" target="_blank">View Archive</a>`;
});
```

Below `initializeSession()`, add a function that can be called to make `POST` requests to the endpoints:

```js
async function postData(url='', data={}){
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok){
      throw new Error('error getting data!');
    }
    return response.json();
  }
  catch (error){
    handleError(error);
  }
}
```

Pressing the start button will call the `startArchiving()` function to make a `POST` request to `/archive/start` passing the `sessionId` and if the status that returns does not equal `started`, send the error to the `handleError` function:

```js
async function startArchiving(){
  console.log('start archiving');
  try {
    archive = await postData('/archive/start',{sessionId});
    console.log('archive started: ', archive);
    if (archive.status !== 'started'){
      handleError(archive.error);
    } else {
      console.log('successfully started archiving: ',archive);
    }
  }
  catch(error){
    handleError(error);
  }
}

archiveStartBtn.addEventListener('click', startArchiving, false);
```


Pressing the stop button will call the `stopArchiving()` function to make a `POST` request to the stop archiving endpoint with the archive ID inserted to the backend and if the status that returns does not equal `stopped`, send the error to the `handleError` function:

```js
async function stopArchiving(){
  console.log('stop archiving');
  try {
    archive = await postData(`/archive/${archive.id}/stop`,{});
    console.log('archive stopped: ', archive);
    if (archive.status !== 'stopped'){
      handleError(archive.error);
    } else {
      console.log('successfully stopped archiving: ',archive);
    }
  }
  catch(error){
    handleError(error);
  }
}

archiveStopBtn.addEventListener('click', stopArchiving, false);
```