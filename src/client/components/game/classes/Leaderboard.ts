import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';
import MainGame from '../scenes/MainGame';


export default class Leaderboard extends Phaser.GameObjects.Container {
  text: BBCodeText;
  leaderboardText: BBCodeText;
  lbData: any;
  constructor(scene: MainGame, x: number, y: number) {
    super(scene, x, y);

    this.text = new BBCodeText(scene, 1280, 0, '[size=50]Leaderboard[/size]', {
      fontSize: '50px',
      align: 'center',
      fontFamily: 'Arial',

    }).setOrigin(1, 0);
    this.leaderboardText = new BBCodeText(scene, 1260, this.text.displayHeight+2, '', {
      fontSize: '30px',
      align: 'center',
      fontFamily: 'Arial',
    }).setOrigin(1, 0);

    this.add(this.text);
    this.add(this.leaderboardText);
    scene.add.existing(this);

}

setLeaderboard(data: any) {
  // this.text.setText(`Leaderboard\n`);
  this.lbData = data;
  let text = ``;
  let amIfound = false;
  for (let i = 0; i < Math.min(5, data.length); i++) {
    let player = data[i];
    text += `[size=30]#${i+1} - ${player.verified ? "[color=#0000FF]":""}${player.name}${player.verified?"[/color]":""} - ${player.coins}[/size]\n`;
    console.log(player.id, (this.scene as MainGame).ws.id);
    if(player.id == (this.scene as MainGame).ws.id) {
      amIfound = true;
    }
  }
  if(!amIfound) {
    let mePlayer = data.find((player: any) => player.id == (this.scene as MainGame).ws.id);
    let myRank = data.findIndex((player: any) => player.id == (this.scene as MainGame).ws.id);
    text += `...\n[size=30]#${myRank+1} - ${mePlayer.verified ? "[color=#0000FF]":""}${mePlayer.name}${mePlayer.verified?"[/color]":""} - ${mePlayer.coins}[/size]\n`;
  }
  this.leaderboardText.setText(text);
}

}