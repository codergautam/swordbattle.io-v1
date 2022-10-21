import Phaser from 'phaser';
import Title from './Title';

class Preload extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload() {
   
  }

  create() {
    console.log("Preload")
   this.scene.start(Title);
  }
}

export default Preload;
