/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import Packet from '../../../../shared/Packet';
import Player from '../classes/Player';
import MainGame from '../scenes/MainGame';
import angleFromKeys from './angleFromKeys';

interface keyObj {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
}

const setMouseRot = (scene: MainGame, myPlayer: Player | undefined) => {
  if (!myPlayer) return 0;
  const mousePos = scene.input.mousePointer;
  const angle = (Math.atan2(mousePos.y - (720 / 2), mousePos.x - (1280 / 2)) * 180) / Math.PI;
  myPlayer.setDirection(angle);
  return angle;
};
let lastPacketSend = 0;
export default (scene: MainGame) => {
  // Get required stuff from scene
  const { myPlayer, ws, passedData } = scene;
  const { keys } = passedData;

  // Set the rotation of the player to the mouse
  setMouseRot(scene, myPlayer);

  // Initialize stuff to send
  let sendData: any;
  sendData = { changed: false };

  // Last direction
  let lastDirection = 0;

  // Event for when mouse is moved
  scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
    const angle = Number(Phaser.Math.DegToRad(setMouseRot(scene, myPlayer)).toPrecision(3));
    if (angle !== lastDirection) {
      sendData.changed = true;
      sendData.angle = angle;
      lastDirection = angle;
    }
  });

  const { KeyCodes } = Phaser.Input.Keyboard;
  const cursors = (scene.input.keyboard.addKeys({
    up: KeyCodes.UP,
    down: KeyCodes.DOWN,
    left: KeyCodes.LEFT,
    right: KeyCodes.RIGHT,
    enter: KeyCodes.ENTER,
    esc: KeyCodes.ESC,
  }, false) as keyObj);

  const key = cursors;

  if (keys) {
    const wKey = scene.input.keyboard.addKey('W', false);
    const aKey = scene.input.keyboard.addKey('A', false);
    const sKey = scene.input.keyboard.addKey('S', false);
    const dKey = scene.input.keyboard.addKey('D', false);
    let stoppedMoving = false;
    const keyChange = () => {
      let controller = { up: false, down: false, left: false, right: false };

      try {
        if (key.up.isDown || wKey.isDown) controller.up = true;
        if (key.down.isDown || sKey.isDown) controller.down = true;
        if (key.left.isDown || aKey.isDown) controller.left = true;
        if (key.right.isDown || dKey.isDown) controller.right = true;

        // Use controller to calculate angle
        const angle = angleFromKeys(controller);

        if (!sendData.move || sendData.move !== angle) {
          sendData.move = angle;
          // check if no keys are pressed
          if (!controller.up && !controller.down && !controller.left && !controller.right) {
            sendData.force = 0;
            stoppedMoving = true;
          } else if (stoppedMoving) {
            sendData.force = 1;
            stoppedMoving = false;
          }

          if (!('force' in sendData)) sendData.force = 1;
          sendData.changed = true;
        }
      } catch (e) {
        console.log(e);
      }
    };

    aKey.on('down', keyChange);
    sKey.on('down', keyChange);
    wKey.on('down', keyChange);
    dKey.on('down', keyChange);
    key.up.on('down', keyChange);
    key.down.on('down', keyChange);
    key.left.on('down', keyChange);
    key.right.on('down', keyChange);

    // up
    aKey.on('up', keyChange);
    sKey.on('up', keyChange);
    wKey.on('up', keyChange);
    dKey.on('up', keyChange);
    key.up.on('up', keyChange);
    key.down.on('up', keyChange);
    key.left.on('up', keyChange);
    key.right.on('up', keyChange);
  }

  // Mouse down and up
  scene.input.on(Phaser.Input.Events.POINTER_UP, () => {
    sendData.changed = true;
    sendData.mouseDown = false;
    if (myPlayer) myPlayer.setMouseDown(false);
  });
  scene.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
    if (!sendData.mouseDown) sendData.changed = true;
    sendData.mouseDown = true;
    if (myPlayer) {
      myPlayer.setMouseDown(true);
    }
  });

  // Send data to server if it has changed
  // eslint-disable-next-line no-param-reassign
  scene.controllerUpdate = () => {
    if (sendData.changed) {
      let toSend: {
        md?: boolean;
        d?: number;
        m?: number;
        f?: number;
      };
      toSend = {};

      if (sendData.angle !== undefined) toSend.d = sendData.angle;
      if (sendData.force !== undefined) toSend.f = sendData.force;
      if ((sendData.force !== undefined && toSend.f !== 0) || (sendData.force === undefined)) {
        if (sendData.move !== undefined) toSend.m = sendData.move;
      }
      if (sendData.mouseDown !== undefined) toSend.md = sendData.mouseDown;

      if ((toSend.f === undefined) && (toSend.m === undefined) && (Date.now() - lastPacketSend < 1000 / 10)) return;
      const packet = new Packet(Packet.Type.PLAYER_MOVE, toSend);
      ws.send(packet, true);
      lastPacketSend = Date.now();
      sendData = { changed: false };
    }
  };
};
