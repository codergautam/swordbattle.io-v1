/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import Packet from '../../../../shared/Packet';
import Player from '../classes/Player';
import MainGame from '../scenes/MainGame';

const setMouseRot = (scene: MainGame, myPlayer: Player) => {
  const mousePos = scene.input.mousePointer;
  const angle = (Math.atan2(mousePos.y - (720 / 2), mousePos.x - (1280 / 2)) * 180) / Math.PI;
  myPlayer.setDirection(angle);
  return angle;
};

export default (scene: MainGame) => {
  const { myPlayer, ws } = scene;

  setMouseRot(scene, myPlayer);

  let sendData: any;
  sendData = { changed: false };

  scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
    const angle = Phaser.Math.DegToRad(setMouseRot(scene, myPlayer)).toPrecision(3);
    sendData.angle = angle;
    sendData.changed = true;
  }, this);

  const interval = setInterval(() => {
    if (sendData.changed) {
      let toSend: Array<number>;
      let packetType: number;
      if (Object.keys(sendData).length === 2 && 'angle' in sendData) {
        packetType = Packet.Type.DIR_CHANGE;
        toSend = [sendData.angle];
      } else {
        packetType = Packet.Type.MOVE_CHANGE;
        toSend = [];
        toSend.push(sendData.moveDir);
        if ('angle' in sendData) toSend.push(sendData.angle);
      }

      const packet = new Packet(packetType, toSend);
      ws.send(packet, true);

      sendData = { changed: false };
    }
  }, 1000 / 15);
};
