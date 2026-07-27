import * as THREE from 'three';
import * as xb from 'xrblocks';
import { LipsyncMouth } from 'lipsync';
import { Keyboard } from 'xrblocks/addons/virtualkeyboard/Keyboard.js';

// ⌄⌄⌄ Set Quick Replies ⌄⌄⌄

export class VonageAudioCall extends xb.Script {
  // ⌄⌄⌄ Create constructor ⌄⌄⌄
  // ⌄⌄⌄ Create 3D Avatar ⌄⌄⌄
  // ⌄⌄⌄ Remove 3D Avatar ⌄⌄⌄
  // ⌄⌄⌄ Create Call panel ⌄⌄⌄
  // ⌄⌄⌄ Update Call controls ⌄⌄⌄
  // ⌄⌄⌄ Remove Call panel ⌄⌄⌄
  // ⌄⌄⌄ Show Virtual Keyboard ⌄⌄⌄
  // ⌄⌄⌄ Hide Virtual Keyboard ⌄⌄⌄
  // ⌄⌄⌄ Toggle Virtual Keyboard ⌄⌄⌄
  // ⌄⌄⌄ Send Quick Reply ⌄⌄⌄
  // ⌄⌄⌄ Send Custom Text ⌄⌄⌄
  // ⌄⌄⌄ Create Reply panel ⌄⌄⌄
  // ⌄⌄⌄ Remove Reply panel ⌄⌄⌄
  // ⌄⌄⌄ Answer call method ⌄⌄⌄
  // ⌄⌄⌄ Reject call method ⌄⌄⌄
  // ⌄⌄⌄ Hang Up call method ⌄⌄⌄
  // ⌄⌄⌄ Set Up Vonage Listeners ⌄⌄⌄
  // ⌄⌄⌄ Connect to server to get token ⌄⌄⌄
  // ⌄⌄⌄ Initialize ⌄⌄⌄

  // the update() method runs per frame. This allows the 3D Avatar to face the user as they move around
  update() {
    const head = this.puppetHead;
    const cam = xb.core?.camera;
    if (!head || !cam) return;

    cam.getWorldPosition(this._camWorld);
    head.getWorldPosition(this._headWorld);

    // Mirror the camera through the head centre so local -Z faces the user
    const targetX = 2 * this._headWorld.x - this._camWorld.x;
    const targetZ = 2 * this._headWorld.z - this._camWorld.z;
    // Clamp Y so the avatar only yaws — it won't pitch if you're taller/shorter
    head.lookAt(targetX, this._headWorld.y, targetZ);
  }
}
