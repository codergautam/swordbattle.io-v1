import Phaser from 'phaser';
import MyScene from '../helpers/MyScene';

// Main homescreen scene
// UI is rendered in React

class Title extends Phaser.Scene {
  background: Phaser.GameObjects.Image;
  constructor() {
    super('title');
  }

  create() {
    this.background = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(1);
  
    this.events.on('playButtonClicked', (name: string) => {
      if(!name || name.trim().length < 1) return;
      name = name.trim().substring(0, 12);

      window.localStorage.setItem('name', name);

      this.scene.start('maingame');
    })
  }
}

export default Title;
