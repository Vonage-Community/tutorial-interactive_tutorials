/* global OT SAMPLE_SERVER_BASE_URL */

let applicationId;
let sessionId;
let token;


const publishVideoTrueBtn = document.querySelector('#publish-video-true');
const publishVideoFalseBtn = document.querySelector('#publish-video-false');


// ⌄⌄⌄ get references to archive UI & set stop button display to none ⌄⌄⌄




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
      width: '320',
      height: '240'
    };
    session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  session.on('sessionDisconnected', (event) => {
    console.log('You were disconnected from the session.', event.reason);
  });


  // ⌄⌄⌄ add listener for archiveStarted event ⌄⌄⌄


  // ⌄⌄⌄ add listener for archiveStarted event ⌄⌄⌄


  // initialize the publisher
  const publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError);
    }
  });

  publishVideoTrueBtn.addEventListener('click',() => {
    publisher.publishVideo(true, (error) => {
      if (error) {
        handleError(error);
      } else {
        publishVideoTrueBtn.style.display = 'none';
        publishVideoFalseBtn.style.display = 'block';
      }
    });
  });

  publishVideoFalseBtn.addEventListener('click',() => {
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

// ⌄⌄⌄ function to create POST requests ⌄⌄⌄




// ⌄⌄⌄ function to start an Archive ⌄⌄⌄




// ⌄⌄⌄ function to stop an Archive ⌄⌄⌄


fetch('/session')
.then((response) => response.json())
.then((json) => {
  applicationId = json.applicationId;
  sessionId = json.sessionId;
  token = json.token;
  // Initialize a Vonage Video Session object
  initializeSession();
}).catch((error) => {
  handleError(error);
  alert('Failed to get Vonage Video sessionId and token. Make sure you have updated the config.js file.');
});
