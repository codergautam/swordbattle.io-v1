import Phaser from 'phaser';
import ImageButton from '../classes/ImageButton';

// Main homescreen scene
// UI is rendered in React

class Title extends Phaser.Scene {
  background: Phaser.GameObjects.Image;
  settingsBtn: any;

  constructor() {
    super('title');
  }

  create() {
    console.log('title scene created');
    this.background = this.add.image(0, 0, 'title').setOrigin(0).setScrollFactor(0, 0).setScale(0.7);
    this.settingsBtn = new ImageButton(this, 0, 720, 'settings', ()=>{

      console.log('settings button clicked');
      this.events.emit('settingsBtnClicked');


    }, ()=>{
      // Wont work because of div overlaying
    }, () => {
      // Wont work because of div overlaying
    }, this)
    this.settingsBtn.button.setOrigin(0,1).setScale(0.15);

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

    this.events.on("settingsState", (opened) => {
      if(opened) {
        this.tweens.add({
          targets: this.settingsBtn.button,
          x: -1*this.settingsBtn.button.displayWidth,
          duration: 250,
          ease: 'Power2',
        });
      } else {
        this.tweens.add({
          targets: this.settingsBtn.button,
          x: 0,
          duration: 250,
          ease: 'Power2',
        });
      }
    })

    // document mouse move listener
    document.addEventListener('mousemove', (e) => {
      // x and y
      let bounds = this.scale.canvasBounds

      // convert mouse pos so that 0,0 is top left of canvas
      let x = e.clientX - bounds.left;
      let y = e.clientY - bounds.top;

      // convert mouse pos so that 1280,720 is bottom right of canvas
      x = x / bounds.width * 1280;
      y = y / bounds.height * 720;

      // Check if touching settingsBtn
      if(this.settingsBtn.button.getBounds().contains(x, y)) {
        if(this.settingsBtn.button.scaleX === 0.17) return;
        this.tweens.add({
          targets: this.settingsBtn.button,
          scaleX: 0.17,
          scaleY: 0.17,
          duration: 250,
          ease: 'Power2',
        });
      } else {
        if(this.settingsBtn.button.scaleX === 0.15) return;
        this.tweens.add({
          targets: this.settingsBtn.button,
          scaleX: 0.15,
          scaleY: 0.15,
          duration: 250,
          ease: 'Power2',
        });
      }
    });
  }
}

export default Title;
