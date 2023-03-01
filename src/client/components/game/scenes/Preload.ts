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

    this.load.image('settings', '/assets/images/buttons/settings.png');
    this.load.image('login', '/assets/images/buttons/login.png');
    this.load.image('signup', '/assets/images/buttons/signup.png');
    this.load.image('profile', '/assets/images/buttons/profile.png');

    this.load.image('title', 'assets/images/opening.png');
    this.load.image('grass', '/assets/images/background.jpeg');

    this.load.image('sword', '/assets/images/sword.png');
    this.load.image('player', '/assets/images/player.png');
    this.load.image('coin', '/assets/images/coin.png');
    this.load.image('kill', '/assets/images/kill.png');

    // load chests
    this.load.image('chest1', '/assets/images/chests/chest.png');
    this.load.image('chest2', '/assets/images/chests/uncommonChest.png');
    this.load.image('chest3', '/assets/images/chests/rareChest.png');
    this.load.image('chest4', '/assets/images/chests/epicChest.png');
    this.load.image('chest5', '/assets/images/chests/legendaryChest.png');
    this.load.image('chest6', '/assets/images/chests/mythicalChest.png');
  }

  create() {
    window.dispatchEvent(new Event('resize'));

    // Switch to the title, or "home" screen
    this.scene.start('title');
  }
}

export default Preload;
