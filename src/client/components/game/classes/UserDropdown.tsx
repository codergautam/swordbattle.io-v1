import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';


export default class UserDropdown extends Phaser.GameObjects.Container {
  text: BBCodeText;
  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    super(scene, x, y);

    this.text = new BBCodeText(scene, 1280, 0, name, {
      fontSize: '49px',
      align: 'center',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(1, 0);
    this.text.x += this.text.displayWidth;
    scene.tweens.add({
      targets: this.text,
      x: 1280,
      duration: 1000,
      ease: 'Power2',
    });
    this.add(this.text);
    scene.add.existing(this);

}
}