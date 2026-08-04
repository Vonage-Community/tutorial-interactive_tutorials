const captureScreenshot = async () => {
  const displayMediaOptions = {
    video: {
      displaySurface: 'tab',
    },
    audio: false,
    preferCurrentTab: true,
  };
  const captureTab = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

  // Since we capture a screenshot from a live video, we need to set up a video element and load the stream
  const video = document.createElement('video');
  video.srcObject = captureTab;
  await video.play();

  // This part handles drawing the current frame onto a canvas
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

  // This line stops the capturing to free up resources
  captureTab.getTracks().forEach((track) => track.stop());

  const screenshotData = canvas.toDataURL('image/png');
  return screenshotData;
};

export default captureScreenshot;
