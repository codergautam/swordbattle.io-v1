import Phaser from 'phaser';

class Title extends Phaser.Scene {
  background: Phaser.GameObjects.Image;
  constructor() {
    super('title');
  }

  preload() {
   
  }

  create() {
    this.background = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(2);

    // resize handler
    this.scale.on('resize', (gameSize) => {
      if(this.game.scene.isActive('title')) {
        this.resize(gameSize);
      }
    }, this);

    this.resize(this.scale.gameSize);
  }
  resize(gameSize: {width: number; height: number;}) {
    var width = gameSize.width;
    var height = gameSize.height;

    console.log(width, height);

    this.background.setScale(Math.max(width / this.background.width, height / this.background.height));

    this.background.x = 0 - ((this.background.displayWidth - width) / 2);
  }
}

export default Title;
