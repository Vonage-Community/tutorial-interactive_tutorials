/* global OT SAMPLE_SERVER_BASE_URL */

let applicationId;
let sessionId;
let token;

const publishVideoTrueBtn = document.querySelector('#publish-video-true');
const publishVideoFalseBtn = document.querySelector('#publish-video-false');

let archive;
const archiveStartBtn = document.querySelector('#start');
const archiveStopBtn = document.querySelector('#stop');
const archiveLinkSpan = document.querySelector('#archiveLink');

archiveStopBtn.style.display = "none";

// ⌄⌄⌄ set a variable to hold the streamId and get references to archive UI ⌄⌄⌄

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function initializeSession() {
  const session = OT.initSession(applicationId, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    };
    session.subscribe(
      event.stream,
      'participants',
      subscriberOptions,
      handleError
    );
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });

  session.on('archiveStarted', (event) => {
    archive = event;
    console.log('Archive started ' + archive.id);
    archiveStartBtn.style.display = 'none';
    archiveStopBtn.style.display = 'inline';
    archiveLinkSpan.innerHTML = '';
  });

  session.on('archiveStopped', (event) => {
    archive = event;
    console.log('Archive stopped ' + archive.id);
    archiveStartBtn.style.display = 'inline';
    archiveStopBtn.style.display = 'none';
    archiveLinkSpan.innerHTML = `<a href="/archive/${archive.id}/view" target="_blank">View Archive</a>`;
  });

  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%',
  };
  const publisher = OT.initPublisher(
    'participants',
    publisherOptions,
    handleError
  );

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError);
      // ⌄⌄⌄ set streamId to publisher.streamId ⌄⌄⌄

    }
  });

  publishVideoTrueBtn.addEventListener('click', () => {
    publisher.publishVideo(true, (error) => {
      if (error) {
        handleError(error);
      } else {
        publishVideoTrueBtn.style.display = 'none';
        publishVideoFalseBtn.style.display = 'block';
      }
    });
  });

  publishVideoFalseBtn.addEventListener('click', () => {
    publisher.publishVideo(false, (error) => {
      if (error) {
        alert('error: ', error);
      } else {
        publishVideoFalseBtn.style.display = 'none';
        publishVideoTrueBtn.style.display = 'block';
      }
    });
  });
}

async function postData(url = '', data = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('error getting data!');
    }
    return response.json();
  }
  catch (error) {
    handleError(error);
  }
}

async function startArchiving() {
  console.log('start archiving');
  try {
    archive = await postData('/archive/start', { sessionId });
    console.log('archive started: ', archive);
    if (archive.status !== 'started') {
      handleError(archive.error);
    } else {
      console.log('successfully started archiving: ', archive);
    }
  }
  catch (error) {
    handleError(error);
  }
}

archiveStartBtn.addEventListener('click', startArchiving, false);

async function stopArchiving() {
  console.log('stop archiving');
  try {
    archive = await postData(`/archive/${archive.id}/stop`, {});
    console.log('archive stopped: ', archive);
    if (archive.status !== 'stopped') {
      handleError(archive.error);
    } else {
      console.log('successfully stopped archiving: ', archive);
    }
  }
  catch (error) {
    handleError(error);
  }
}

archiveStopBtn.addEventListener('click', stopArchiving, false);

// ⌄⌄⌄ add listener for a change event in the layout select element ⌄⌄⌄


fetch('/session')
  .then((response) => response.json())
  .then((json) => {
    applicationId = json.applicationId;
    sessionId = json.sessionId;
    token = json.token;
    // Initialize a Vonage Video Session object
    initializeSession();
  })
  .catch((error) => {
    handleError(error);
    alert(
      'Failed to get Vonage Video sessionId and token. Make sure you have updated the config.js file.'
    );
  });
