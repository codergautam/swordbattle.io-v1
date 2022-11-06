import Player from '../classes/Player';
import MainGame from '../scenes/MainGame';

const setMouseRot = (scene: MainGame, myPlayer: Player) => {
  const mousePos = scene.input.mousePointer;
  const angle = (Math.atan2(mousePos.y - (720 / 2), mousePos.x - (1280 / 2)) * 180) / Math.PI;
  myPlayer.setDirection(angle);
};

export default (scene: MainGame) => {
  const { myPlayer } = scene;

  setMouseRot(scene, myPlayer);

  scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
    setMouseRot(scene, myPlayer);
  }, this);
};
