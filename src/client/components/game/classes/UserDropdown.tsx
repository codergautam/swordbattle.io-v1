import Phaser from 'phaser';
import BBCodeText from 'phaser3-rex-plugins/plugins/bbcodetext.js';
import Title from '../scenes/Title';
import Button from './Button';


export default class UserDropdown extends Phaser.GameObjects.Container {
  text: BBCodeText;
  profileIcon: Phaser.GameObjects.Image;
  clicked: any;
  logoutButton: Button;
  changeNameBtn: any;
  profileBtn: Button;
  constructor(scene: Title, x: number, y: number, name: string) {
    super(scene, x, y);

    this.text = new BBCodeText(scene, 1280, 0, name, {
      fontSize: '49px',
      align: 'center',
      fontFamily: 'Arial',
      color: "#000000",
    }).setOrigin(1, 0);
    this.profileIcon = new Phaser.GameObjects.Image(scene, 0, 0, 'profile').setOrigin(1, 0).setScale(0.15);
    this.text.x += this.text.displayWidth;
    this.profileIcon.x = this.text.x - this.text.displayWidth - 3;
    scene.tweens.add({
      targets: this.text,
      x: 1270,
      duration: 1000,
      ease: 'Power2',
    });

    this.logoutButton = new Button(scene, 1280, 0, 'Logout', "#000000", "#ffffff", 15, 15, ()=>{}, ()=>{}, ()=>{}, scene);
    this.logoutButton.x = 1280 + (this.logoutButton.background.displayWidth/2);
    this.logoutButton.setVisible(false);

    this.changeNameBtn = new Button(scene, 1280, 0, 'Change Name', "#000000", "#ffffff", 15, 15, ()=>{}, ()=>{}, ()=>{}, scene);
    this.changeNameBtn.x = 1280 + (this.changeNameBtn.background.displayWidth/2);
    this.changeNameBtn.setVisible(false);

    // ProfileBtn
    this.profileBtn = new Button(scene, 1280, 0, 'Profile', "#000000", "#ffffff", 15, 15, ()=>{
      console.log('Profile');
    }, ()=>{}, ()=>{}, scene);
    this.profileBtn.x = 1280 + (this.profileBtn.background.displayWidth/2);
    this.profileBtn.setVisible(false);

    this.add(this.text);
    this.add(this.profileIcon);
    this.add(this.logoutButton);
    scene.add.existing(this);

    this.clicked = false;



    // hover
    document.addEventListener('mousemove', () => {
      let {x, y} = scene.mousePos;
      if (this.text.getBounds().contains(x, y) && this.text.scale !== (this.clicked ? 1.2 : 1.1)) {
        scene.tweens.add({
          targets: this.text,
          scale: this.clicked ? 1.2 : 1.1,
          duration: 100,
          ease: 'Power2',
        });
      } else if(!this.text.getBounds().contains(x, y) && this.text.scale !== (this.clicked ? 1.05 : 1)) {
        scene.tweens.add({
          targets: this.text,
          scale: (this.clicked ? 1.05 : 1),
          duration: 100,
          ease: 'Power2',
        });
      }

      for(let elem of [this.logoutButton, this.changeNameBtn, this.profileBtn]) {
        if(elem.getBounds().contains(x, y) && elem.visible && elem.scale !== 1.05) {
          scene.tweens.add({
            targets: elem,
            scale: 1.05,
            duration: 100,
            ease: 'Power2',
          });
        } else if(!elem.getBounds().contains(x, y) && elem.visible && elem.scale !== 1) {
          scene.tweens.add({
            targets: elem,
            scale: 1,
            duration: 100,
            ease: 'Power2',
          });
        }
      }
    });

    document.addEventListener('mousedown', () => {
      let {x, y} = scene.mousePos;
      // Make sure only call once
      if (this.text.getBounds().contains(x, y)) {
        this.clicked = !this.clicked;
        if(this.clicked) {
          scene.tweens.add({
            targets: this.text,
            scale: 1.2,
            duration: 100,
            ease: 'Power2',
          });
          for(let elem of [this.logoutButton, this.changeNameBtn, this.profileBtn]) {
            elem.setVisible(true);
            scene.tweens.add({
              targets: [elem],
              x: 1280 - (elem.background.displayWidth/2) - 15,
              duration: 100,
              ease: 'Power2',
            });
          }
        } else {
          scene.tweens.add({
            targets: this.text,
            scale: 1.1,
            duration: 100,
            ease: 'Power2',
          });
          for(let elem of [this.logoutButton, this.changeNameBtn, this.profileBtn]) {
            scene.tweens.add({
              targets: [elem],
              x: 1280 + (elem.background.displayWidth/2),
              duration: 100,
              ease: 'Power2',
              onComplete: () => {
                elem.setVisible(false);
              }
            });
          }
        }
      }
    });


}

preUpdate() {
  this.profileIcon.x = this.text.x - this.text.displayWidth - 3;
  this.text.y = (this.profileIcon.displayHeight / 2 - this.text.displayHeight / 2 ) - 5;
  this.profileIcon.scale = this.text.scale * 0.15;


  this.profileBtn.y = this.text.y + this.text.displayHeight + 30;
  this.changeNameBtn.y = this.profileBtn.y + this.profileBtn.background.displayHeight + 5;
  this.logoutButton.y = this.changeNameBtn.y + this.changeNameBtn.background.displayHeight + 5;
}
}