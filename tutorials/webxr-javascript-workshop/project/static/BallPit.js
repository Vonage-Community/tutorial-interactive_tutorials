import * as THREE from 'three';
import * as xb from 'xrblocks';
import {palette} from 'xrblocks/addons/utils/Palette.js';

import {BallShooter} from './BallShooter.js';

const kTimeLiveMs = xb.getUrlParamInt('timeLiveMs', 3000);
const kDefalteMs = xb.getUrlParamInt('defalteMs', 200);
const kLightX = xb.getUrlParamFloat('lightX', 0);
const kLightY = xb.getUrlParamFloat('lightY', 500);
const kLightZ = xb.getUrlParamFloat('lightZ', -10);
const kRadius = xb.getUrlParamFloat('radius', 0.08);
const kBallsPerSecond = xb.getUrlParamFloat('ballsPerSecond', 30);
const kVelocityScale = xb.getUrlParamInt('velocityScale', 1.0);
const kNumSpheres = 100;

export class BallPit extends xb.Script {
  constructor() {
    super();
    this.ballShooter = new BallShooter({
      numBalls: kNumSpheres,
      radius: kRadius,
      palette: palette,
      liveDuration: kTimeLiveMs,
      deflateDuration: kDefalteMs,
    });
    this.add(this.ballShooter);
    this.addLights();

    this.lastBallCreatedTimeForController = new Map();
    this.pointer = new THREE.Vector2();
    this.velocity = new THREE.Vector3();
  }

  update() {
    super.update();
  }

  // Adds hemisphere light for ambient lighting and directional light.
  addLights() {
    this.add(new THREE.HemisphereLight(0xbbbbbb, 0x888888, 3));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(kLightX, kLightY, kLightZ);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048; // Default is usually 1024
    light.shadow.mapSize.height = 2048; // Default is usually 1024
    this.add(light);
  }

  // Calculates pointer position in normalized device coordinates.
  updatePointerPosition(event) {
    // (-1 to +1) for both components
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // scale pointer.x from [-1, 0] to [-1, 1]
    this.pointer.x = 1 + 2 * this.pointer.x;
  }

  onPointerDown(event) {
    console.log('onPointerDown: ', event);
    // 1. Guard: If the click originated on a UI DOM element or canvas overlay, ignore it
    if (event.target && (event.target.tagName === 'BUTTON' || event.target.closest('.uikit') || event.target.closest('canvas') === false)) {
      return;
    }
    this.updatePointerPosition(event);

    // 2. Guard: Raycast against the scene to check if we clicked a UICard / UIButton 3D object
    const cameras = xb.core.renderer.xr.getCamera().cameras;
    if (cameras.length == 0) return;
    const camera = cameras[0];

    this.raycaster.setFromCamera(this.pointer, camera);
    const intersects = this.raycaster.intersectObjects(xb.core.scene.children, true);
    
    for (const hit of intersects) {
      let obj = hit.object;
      while (obj) {
        // If ray hits any UI component, cancel ball spawning so the UI click goes through
        if (obj.isUICard || obj.isUIElement || obj.isUIButton || obj.constructor?.name?.includes('UI')) {
          return;
        }
        obj = obj.parent;
      }
    }

    // Spawn a ball slightly in front of the camera.
    const position = new THREE.Vector3(0.0, 0.0, -0.2)
      .applyQuaternion(camera.quaternion)
      .add(camera.position);
    const matrix = new THREE.Matrix4();
    matrix.setPosition(position.x, position.y, position.z);
    // Convert pointer position to angle based on the camera.
    const vector = new THREE.Vector4(this.pointer.x, this.pointer.y, 1.0, 1);
    const inverseProjectionMatrix = camera.projectionMatrix.clone().invert();
    vector.applyMatrix4(inverseProjectionMatrix);
    vector.multiplyScalar(1 / vector.w);
    this.velocity.copy(vector);
    this.velocity.normalize().multiplyScalar(4.0);
    this.velocity.applyQuaternion(camera.quaternion);
    this.ballShooter.spawnBallAt(position, this.velocity);
  }


  onSelectStart(event) {
    // Prevent shooting balls if we clicked on a UI element
    if (event.target && event.target !== this) return;
    
    const controller = event.source.controller;
    if (!controller) return;

    const newPosition = new THREE.Vector3(0.0, 0.0, -0.08)
      .applyQuaternion(controller.quaternion)
      .add(controller.position);

    this.velocity.set(0, 0, -5.0);
    this.velocity.applyQuaternion(controller.quaternion);

    this.ballShooter.spawnBallAt(newPosition, this.velocity);
  }

  onSelecting(event) {
    // Prevent shooting balls if we are holding down a click on a UI element
    if (event.target && event.target !== this) return;

    const controller = event.source.controller;
    if (!controller) return;

    const now = performance.now();
    if (!this.lastBallCreatedTimeForController.has(controller)) {
      this.lastBallCreatedTimeForController.set(controller, -99);
    }
    if (
      controller.userData.selected &&
      now - this.lastBallCreatedTimeForController.get(controller) >=
        1000 / kBallsPerSecond
    ) {
      // Place this 8 cm in front of the hands.
      const newPosition = new THREE.Vector3(0.0, 0.0, -0.08)
        .applyQuaternion(controller.quaternion)
        .add(controller.position);

      this.velocity.set(0, 0, -5.0 * kVelocityScale);
      this.velocity.applyQuaternion(controller.quaternion);

      this.ballShooter.spawnBallAt(newPosition, this.velocity);

      this.lastBallCreatedTimeForController.set(controller, now);
    }
  }
    
}