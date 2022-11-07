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
  const { myPlayer, ws, passedData } = scene;
  const { keys } = passedData;
  setMouseRot(scene, myPlayer);

  let sendData: any;
  sendData = { changed: false };

  scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
    const angle = Phaser.Math.DegToRad(setMouseRot(scene, myPlayer)).toPrecision(3);
    sendData.angle = angle;
    sendData.changed = true;
  });

  alert(keys)
const  KeyCodes = Phaser.Input.Keyboard.KeyCodes;
  				const cursors = scene.input.keyboard.addKeys({
					up: KeyCodes.UP,
					down: KeyCodes.DOWN,
					left: KeyCodes.LEFT,
					right: KeyCodes.RIGHT,
					enter: KeyCodes.ENTER,
					esc: KeyCodes.ESC,
				}, false);
  
    const key = cursors;
    const wKey = scene.input.keyboard.addKey("W", false);
		const aKey = scene.input.keyboard.addKey("A", false);
		const sKey = scene.input.keyboard.addKey("S", false);
		const dKey = scene.input.keyboard.addKey("D",false);
 const keyChange = () => {
    let angle = 0;
    try{ 
    		if (key.up.isDown || wKey.isDown ) {
				alert("up")

			}
			if (key.down.isDown || sKey.isDown ) {
								alert("down")

			}
			if (key.right.isDown || dKey.isDown) {
								alert("right")

			}
			if (key.left.isDown || aKey.isDown) {
								alert("left")

			}
		} catch(e) {
			console.log(e);
		}
 }

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
