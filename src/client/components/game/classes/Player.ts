export default class Player extends Phaser.GameObjects.Container {
  id: string;
  mySelf: boolean;
  constructor(scene: Phaser.Scene, x: number, y: number, name: string, id: string, mySelf: boolean) {
    super(scene, x, y);
    this.name = name;
    this.id = id;
    this.mySelf = mySelf;



    this.scene.add.existing(this);
  }
}