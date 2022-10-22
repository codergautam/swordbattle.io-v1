import Phaser from 'phaser';
import MyScene from '../helpers/MyScene';

// Main homescreen scene
// UI is rendered in React

class Title extends Phaser.Scene implements MyScene {
  background: Phaser.GameObjects.Image;
  constructor() {
    super('title');
  }

  create() {
    this.background = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(2);

    this.resize(this.scale.gameSize);
  }
  resize(gameSize: Phaser.Structs.Size) {
    console.log('resize', gameSize);
    var width = gameSize.width;
    var height = gameSize.height;

    this.background.setScale(Math.max(width / this.background.width, height / this.background.height));

    this.background.x = 0 - ((this.background.displayWidth - width) / 2);
  }
}

export default Title;
