import Phaser from 'phaser';
import Title from './Title';

class Preload extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload() {
    // This is the first scene that will be loaded when opening the game
    //  Do preload logic here, loading assets, etc.

    this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);


    this.load.image('title', 'assets/images/opening.png');
    this.load.image('grass', '/assets/images/background.jpeg');

    this.load.image('sword', '/assets/images/sword.png');
    this.load.image('player', '/assets/images/player.png');
  }

  create() {
    window.dispatchEvent(new Event('resize'));

    // Switch to the title, or "home" screen
    this.scene.start('title');
  }
}

export default Preload;
