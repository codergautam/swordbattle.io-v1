import Phaser from 'phaser';
import ImageButton from '../classes/ImageButton';

// Main homescreen scene
// UI is rendered in React

function smoothHide(elem, x, y: any=elem.y, scene) {
  scene.tweens.add({
    targets: elem,
    x: x,
    y: y,
    duration: 250,
    ease: 'Power2',
  });
}

let recaptcha = ((window as any).grecaptcha as any);

class Title extends Phaser.Scene {
  background: Phaser.GameObjects.Image;
  settingsBtn: any;
  loginBtn: ImageButton;
  signupBtn: ImageButton;

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
    }, this);

    this.loginBtn = new ImageButton(this, 1280, 0, 'login', ()=>{
      console.log('login button clicked');
      this.events.emit('loginBtnClicked');
    }, ()=>{
      // Wont work because of div overlaying
    }, () => {
      // Wont work because of div overlaying
    }, this);

    this.signupBtn = new ImageButton(this, 1280, this.loginBtn.button.displayHeight*0.2, 'signup', ()=>{
      console.log('signup button clicked');
      this.events.emit('signupBtnClicked');
    }, ()=>{
      // Wont work because of div overlaying
    }, () => {
      // Wont work because of div overlaying
    }, this);

    this.settingsBtn.button.setOrigin(0,1).setScale(0.15);
    this.loginBtn.button.setOrigin(1,0).setScale(0.2);
    this.signupBtn.button.setOrigin(1,0).setScale(0.2);

    this.loginBtn.button.x = this.loginBtn.button.displayWidth;
    this.signupBtn.button.x = this.signupBtn.button.displayWidth;
    this.tweens.add({
      targets: [this.loginBtn.button, this.signupBtn.button],
      x: 0,
      duration: 250,
      ease: 'Power2',
    });


    this.settingsBtn.button.x = -1*this.settingsBtn.button.displayWidth;
    this.tweens.add({
      targets: this.settingsBtn.button,
      x: 0,
      duration: 250,
      ease: 'Power2',
    });

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

    const modalChange = (opened) => {
      if(opened) {
        smoothHide(this.settingsBtn.button, -1*this.settingsBtn.button.displayWidth, undefined, this);
        smoothHide(this.loginBtn.button, this.loginBtn.button.displayWidth, undefined, this);
        smoothHide(this.signupBtn.button, this.signupBtn.button.displayWidth, undefined, this);
      } else {
        smoothHide(this.settingsBtn.button, 0, undefined, this);
        smoothHide(this.loginBtn.button, 0, undefined, this);
        smoothHide(this.signupBtn.button, 0, undefined, this);
      }
    }

    this.events.on("settingsState", (opened) => {
      modalChange(opened);
    })
    this.events.on("loginState", (opened) => {
      modalChange(opened);
    })
    this.events.on("signupState", (opened) => {
      modalChange(opened);
    })
    function attemptDisplayLogin(captcha, secret) {
      console.log(captcha, secret)
      fetch('/api/getData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({secret, captcha}),
      }).then((res) => res.json()).then((data) => {
        console.log(data);
      });
    }
    this.events.on("loginSuccess", (data: {secret: string, success: boolean}) => {
      // Hide login/signup buttons
      this.loginBtn.setVisible(false);
      this.signupBtn.setVisible(false);
      let secret = data.secret;

      if(recaptcha) {
        recaptcha.ready(function() {
          fetch('/api/recaptchaSiteKey').then(res => res.json()).then(data => {
            if(!data.success) attemptDisplayLogin(undefined, secret);
            recaptcha.execute(data.siteKey, {action: 'relogin'}).then(token => {
              attemptDisplayLogin(token, secret);
            });
          }).catch(err => {
            console.error(err);
            attemptDisplayLogin(undefined, secret);
          });
        });
      }
    });

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

      // Check if touching loginBtn
      if(this.loginBtn.button.getBounds().contains(x, y) && this.loginBtn.button.scaleX !== 0.25) {
        this.tweens.add({
          targets: this.loginBtn.button,
          scaleX: 0.25,
          scaleY: 0.25,
          duration: 250,
          ease: 'Power2',
        });
      } else if(!this.loginBtn.button.getBounds().contains(x, y) && this.loginBtn.button.scaleX !== 0.2) {
        this.tweens.add({
          targets: this.loginBtn.button,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: 250,
          ease: 'Power2',
        });
      }

      // Check if touching signupBtn
      if(this.signupBtn.button.getBounds().contains(x, y) && this.signupBtn.button.scaleX !== 0.25) {
        this.tweens.add({
          targets: this.signupBtn.button,
          scaleX: 0.25,
          scaleY: 0.25,
          duration: 250,
          ease: 'Power2',
        });
      } else if(!this.signupBtn.button.getBounds().contains(x, y) && this.signupBtn.button.scaleX !== 0.2) {
        this.tweens.add({
          targets: this.signupBtn.button,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: 250,
          ease: 'Power2',
        });
      }

      this.signupBtn.y = this.loginBtn.button.displayHeight;

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
