import Phaser from 'phaser';

// Main homescreen scene
// UI is rendered in React

class Title extends Phaser.Scene {
  background: Phaser.GameObjects.Image;

  constructor() {
    super('title');
  }

  create() {
    console.log('title scene created');
    this.background = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(0.7);

    this.events.once('playButtonClicked', (suppliedName: string) => {
      let name = suppliedName;
      if (!name || name.trim().length < 1) return;
      name = name.trim().substring(0, 12);

      try {
        window.localStorage.setItem('name', name);
      } catch (e) {
        console.log(e);
      }

      this.scene.start('maingame', { name, keys: true, volume: 1 });
    });
  }
}

export default Title;
