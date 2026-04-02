/* global OT SAMPLE_SERVER_BASE_URL */

let applicationId;
let session;
let sessionId;
let token;

// ⌄⌄⌄ get references to text chat UI ⌄⌄⌄

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function initializeSession() {
  session = OT.initSession(applicationId, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    };
    session.subscribe(
      event.stream,
      'subscriber',
      subscriberOptions,
      handleError
    );
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });

  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%',
  };
  const publisher = OT.initPublisher(
    'publisher',
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
    }
  });

  // ⌄⌄⌄ add session listener for a signal message ⌄⌄⌄
}

// ⌄⌄⌄ send a signal with chat message when submitting a form ⌄⌄⌄

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
