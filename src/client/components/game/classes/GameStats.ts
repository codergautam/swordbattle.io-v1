import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';
import MainGame from '../scenes/MainGame';


export default class GameStats extends Phaser.GameObjects.Container {
  text: BBCodeText;
  kills: number;
  coins: number;
  constructor(scene: MainGame, x: number, y: number) {
    super(scene, x, y);

    this.text = new BBCodeText(scene, 10, 10, '', {
      fontSize: '70px',
      fontFamily: 'Arial',

    }).setOrigin(0, 0);

    this.add(this.text);
    scene.add.existing(this);

    this.text.addImage("coin", {
      key: "coin",
      width: 70,
      height: 70
    });
    this.text.addImage("kill", {
      key: "kill",
      width: 70,
      height: 70
    });

    this.kills = 0;
    this.coins = 0;



}

setCoins(coins: number) {
  this.coins = coins;
  this.render();
}

setKills(kills: number) {
  this.kills = kills;
  this.render();
}

render() {
  this.text.setText(`[img=coin][size=50] ${this.coins}\n[img=kill] ${this.kills}[/size]`);
}
}