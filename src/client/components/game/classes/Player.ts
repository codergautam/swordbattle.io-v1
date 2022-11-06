import controller from '../helpers/controller';
import dynamicSkinLoader from '../helpers/dynamicSkinLoader';
import MainGame from '../scenes/MainGame';

export default class Player extends Phaser.GameObjects.Container {
  id: string;
  skin: string;
  player: Phaser.GameObjects.Image;
  sword: Phaser.GameObjects.Image;
  mySelf: boolean;
  constructor(scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    id: string,
    skin: string) {
    super(scene, x, y);
    this.name = name;
    this.id = id;
    this.skin = skin;
    this.mySelf = (this.scene as MainGame).ws.id === this.id;

    dynamicSkinLoader(this.scene, this.skin).then((data) => {
      this.player = new Phaser.GameObjects.Image(this.scene, 0, 0, data.skin);
      this.sword = new Phaser.GameObjects.Image(this.scene, 0, 0, data.sword);

      this.add([this.player, this.sword]);

      if (this.mySelf) {
        controller(this.scene as MainGame);
      }
    });

    this.addToUpdateList();
    this.scene.add.existing(this);
  }

  setDirection(angle: number) {
    this.sword.angle = angle + 45;
    this.player.angle = angle;
    const moveFactor = (100 / (this.player.scale * 100)) * 1.5;
    this.sword.x = (this.player.displayWidth / moveFactor) * Math.cos(this.sword.rotation);
    this.sword.y = (this.player.displayWidth / moveFactor) * Math.sin(this.sword.rotation);
  }

  // eslint-disable-next-line class-methods-use-this
  preUpdate() {
    // Todo; movement?
  }
}
