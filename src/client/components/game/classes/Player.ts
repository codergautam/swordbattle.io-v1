import controller from '../helpers/controller';
import dynamicSkinLoader from '../helpers/dynamicSkinLoader';
import MainGame from '../scenes/MainGame';
import constants from '../../../../server/helpers/constants';

export default class Player extends Phaser.GameObjects.Container {
  id: string;
  skin: string;
  player: Phaser.GameObjects.Image;
  sword: Phaser.GameObjects.Image;
  mySelf: boolean;
  dir: number;
  force: number;
  lastUpdate: number;
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
    this.lastUpdate = Date.now();

    dynamicSkinLoader(this.scene, this.skin).then((data) => {
      this.player = new Phaser.GameObjects.Image(this.scene, 0, 0, data.skin).setScale(0.5);
      this.sword = new Phaser.GameObjects.Image(this.scene, 0, 0, data.sword).setScale(0.5);

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
    this.sword.x = (this.player.displayWidth * 0.69) * Math.cos(this.sword.rotation);
    this.sword.y = (this.player.displayWidth * 0.69) * Math.sin(this.sword.rotation);
  }

  move(dir: number, force: number, currentPos: {x: number, y: number}) {
    // const angle = Phaser.Math.DegToRad(this.player.angle);
    // const x = Math.cos(angle) * dir * force;
    // const y = Math.sin(angle) * dir * force;
    console.log(currentPos);
    // Distance between position and current position
    const distance = Phaser.Math.Distance.Between(currentPos.x, currentPos.y, this.x, this.y);
    if (distance < 1) {
      this.x = currentPos.x;
      this.y = currentPos.y;
      this.dir = dir;
      this.force = force;
    } else {
      this.scene.tweens.add({
        targets: this,
        x: currentPos.x,
        y: currentPos.y,
        duration: 100,
        ease: 'Linear',
        onComplete: () => {
          this.dir = dir;
          this.force = force;
        },
      });
    }
  }
  // eslint-disable-next-line class-methods-use-this
  preUpdate() {
    const delta = Date.now() - this.lastUpdate;
    this.lastUpdate = Date.now();
    if (this.force > 0) {
      const expDel = (1000 / constants.expected_tps);
      const x = Math.cos(this.dir) * this.force * (delta / expDel);
      const y = Math.sin(this.dir) * this.force * (delta / expDel);
      this.x += x;
      this.y += y;
    }
  }
}
