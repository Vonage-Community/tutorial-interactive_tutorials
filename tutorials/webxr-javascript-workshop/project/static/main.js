import 'xrblocks/addons/simulator/SimulatorAddons.js';

import RAPIER from '@dimforge/rapier3d-simd-compat';
import * as xb from 'xrblocks';

import {BallPit} from './BallPit.js';

// ⌄⌄⌄ import Vonage Call Panel and Exit Button ⌄⌄⌄

const depthMeshColliderUpdateFps = xb.getUrlParamFloat(
  'depthMeshColliderUpdateFps',
  5
);

const useSceneMesh = xb.getUrlParamBool('scenemesh', false);
const sceneMeshDebug = xb.getUrlParamBool('scenemeshdebug', false);

const options = new xb.Options();
if (useSceneMesh) {
  options.world.enableMeshDetection();
  options.world.meshes.showDebugVisualizations = sceneMeshDebug;
} else {
  options.depth = new xb.DepthOptions(xb.xrDepthMeshPhysicsOptions);
  options.depth.depthMesh.colliderUpdateFps = depthMeshColliderUpdateFps;
  options.depth.matchDepthView = false;
}
options.reticles.enabled = false;
options.controllers.performRaycastOnUpdate = false;
options.xrButton = {
  ...options.xrButton,
  startText: '<i id="xrlogo"></i> LET THE FUN BEGIN',
  endText: '<i id="xrlogo"></i> MISSION COMPLETE',
};
options.physics.RAPIER = RAPIER;

// Ask for Microphone Access
async function getMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log('Microphone access granted', stream);
    // You can now use the stream object for your application (e.g., recording, WebRTC)
    
    // Optional: Stop the tracks immediately if you just want to check permission state without active recording
    stream.getTracks().forEach(track => track.stop()); 

  } catch (err) {
    console.error(`Error getting microphone access: ${err.name}`, err);
    // Handle specific errors
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      alert('Permission denied. Please allow microphone access in your browser settings.');
    } else if (err.name === 'NotFoundError') {
      alert('No microphone found.');
    }
  }
}

// Initializes the scene, camera, xrRenderer, controls, and XR button.
async function start() {
  xb.add(new BallPit());
  // ⌄⌄⌄ add Vonage Call Panel and Exit Button ⌄⌄⌄
  await xb.init(options);
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(async function () {
    await getMicrophoneAccess();
    start();
  }, 200);
});