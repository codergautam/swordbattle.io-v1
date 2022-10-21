import Phaser from 'phaser';

class Title extends Phaser.Scene {
  constructor() {
    super('title');
  }

  preload() {
   
  }

  create() {
    console.log("Title");
  }
}

export default Title;
