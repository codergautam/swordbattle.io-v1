import dynamicSkinLoader from "../helpers/dynamicSkinLoader";

export default class Player extends Phaser.GameObjects.Container {
  id: string;
  mySelf: boolean;
  skin: string;
  constructor(scene: Phaser.Scene, x: number, y: number, name: string, id: string, skin: string, mySelf: boolean) {
    super(scene, x, y);
    this.name = name;
    this.id = id;
    this.mySelf = mySelf;
    this.skin = skin;

    this.scene.add.existing(this);
  }
}