import Phaser from 'phaser';
import Title from './Title';

class Preload extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload() {
    // This is the first scene that will be loaded when opening the game
    //  Do preload logic here, loading assets, etc.

    this.load.image('title', 'assets/images/opening.png');
    this.load.image('grass', '/assets/images/background.jpeg');

    this.load.image('sword', '/assets/images/sword.png');
    this.load.image('player', '/assets/images/player.png');
    this.load.audio('swing', '/assets/sound/swing.mp3');
    this.load.audio('opening', '/assets/sound/opening.mp3');
    this.load.audio('damage', '/assets/sound/damage.mp3');
  }

  create() {
    window.dispatchEvent(new Event('resize'));

    // Switch to the title, or "home" screen
    this.scene.start('title');
  }
}

export default Preload;
