import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';


export default class Leaderboard extends Phaser.GameObjects.Container {
  text: BBCodeText;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.text = new BBCodeText(scene, 1280, 0, 'Leaderboard', {
      fontSize: '49px',
      align: 'center',
      fontFamily: 'Arial',

    }).setOrigin(1, 0);
    this.add(this.text);
    scene.add.existing(this);

}
}