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
    });

    this.addToUpdateList();

    this.scene.add.existing(this);
  }

  // eslint-disable-next-line class-methods-use-this
  preUpdate() {
    if(this.mySelf) {
      this.sword.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY);
    }
  }
}
