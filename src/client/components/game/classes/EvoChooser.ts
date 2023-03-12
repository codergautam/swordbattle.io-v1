import Phaser from 'phaser';
import MainGame from '../scenes/MainGame';
import evolutionData from '../../../../shared/evolutionData.json'

export default class EvoChooser extends Phaser.GameObjects.Container {
  buttonObjs: Phaser.GameObjects.GameObject[][] = [];
  topText: Phaser.GameObjects.Text;
  constructor(scene: MainGame, x: number, y: number, choices: number[], callback: (choice: number) => void) {
    super(scene, x, y);

    this.buttonObjs = [];
    this.topText = new Phaser.GameObjects.Text(scene, 1280/2, 25, "Choose your evolution", {
      fontFamily: "Arial",
      fontSize: "50px",
      color: "#FFFFFF",
    }).setOrigin(0.5, 0.5);
    this.add(this.topText);


    let disFromTop = 140;
    let height = 150;
    // Calculate width and spacing based on number of choices
    let width = 500 / choices.length;
    let spacing = 25;
    let factorToCenter = (1280 / 2 - (width * choices.length + spacing * (choices.length - 1)) / 2) /1.5;

    for(let i = 0; i < choices.length; i++) {
      this.buttonObjs[i] = [];
      console.log(evolutionData, choices[i]);
      let evolData = evolutionData[choices[i].toString()];
      let buttonBack = new Phaser.GameObjects.Rectangle(scene, (width*((i+1)))+(spacing*i)+factorToCenter, disFromTop, width, height, 0x000000, 0.5);
      this.buttonObjs[i].push(buttonBack);

      let playerImg = new Phaser.GameObjects.Image(scene, (width*((i+1)))+(spacing*i)+factorToCenter, disFromTop+15, (this.scene as MainGame).myPlayer?.skin ?? 'player');
      playerImg.setScale(0.4);
      this.buttonObjs[i].push(playerImg);

      // Add overlay
      let overlay = new Phaser.GameObjects.Image(scene, (width*((i+1)))+(spacing*i)+factorToCenter, disFromTop+15, evolData.name+'Overlay');
      overlay.setScale(0.4);
      this.buttonObjs[i].push(overlay);

      //Add text
      let text = new Phaser.GameObjects.Text(scene, (width*((i+1)))+(spacing*i)+factorToCenter, disFromTop-55, evolData.name, {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#FFFFFF',
      }).setOrigin(0.5, 0.5);
      this.buttonObjs[i].push(text);

      // Onclick
      buttonBack.setInteractive();
      buttonBack.on('pointerdown', () => {
        callback(choices[i]);
      });



      this.add(buttonBack);
      this.add(playerImg);
      this.add(overlay);
      this.add(text);
    }

    scene.add.existing(this);
}

}