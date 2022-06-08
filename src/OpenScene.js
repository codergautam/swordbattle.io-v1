import Phaser from "phaser";
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
  
    return (hours == "00"?"": hours+"h ") + (minutes == "00"?"": minutes+"m ") + seconds+"s";
  }


class OpenScene extends Phaser.Scene {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    preload() {
      console.time("load");
        this.e = true;
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x008800).setOrigin(0).setScrollFactor(0, 0).setScale(2);
   this.loadText =  this.add.text(0,0,"Loading").setOrigin(0.5,0.5);
      
      this.loadText.setFontSize(this.canvas.width/20);
      this.loadText.x = this.canvas.width/2;
      this.loadText.y = this.canvas.height/2;
        this.load.plugin("rexvirtualjoystickplugin",    "/joystick.js", true);
        this.load.plugin("rexbbcodetextplugin", "/textplus.js", true);

        this.load.image("playerPlayer", "/assets/images/player.png");
        this.load.image("playerSword", "/assets/images/sword.png");
        this.load.image("codergautamytPlayer", "/assets/images/codergautamytPlayer.png");
        this.load.image("codergautamytSword", "/assets/images/codergautamytSword.png");
        this.load.image("devilPlayer", "/assets/images/devilPlayer.png");
        this.load.image("devilSword", "/assets/images/devilSword.png");
        this.load.image("winterPlayer", "/assets/images/winterPlayer.png");
        this.load.image("winterSword", "/assets/images/winterSword.png");
        this.load.image("chefPlayer", "/assets/images/chefPlayer.png");
        this.load.image("chefSword", "/assets/images/chefSword.png");
        this.load.image("medicPlayer", "/assets/images/medicPlayer.png");
        this.load.image("medicSword", "/assets/images/medicSword.png");
        this.load.image("ninjaPlayer", "/assets/images/ninjaPlayer.png");
        this.load.image("ninjaSword", "/assets/images/ninjaSword.png");
        this.load.image("hackerPlayer", "/assets/images/hackerPlayer.png");
        this.load.image("hackerSword", "/assets/images/hackerSword.png");
        this.load.image("mitbladeSword", "/assets/images/mitbladeSword.png");
        this.load.image("mitbladePlayer", "/assets/images/mitbladePlayer.png");
        this.load.image("foxPlayer", "/assets/images/foxPlayer.png");
        this.load.image("foxSword", "/assets/images/devilSword.png");
        this.load.image("springPlayer", "/assets/images/springPlayer.png");
        this.load.image("springSword", "/assets/images/springSword.png");
        this.load.image("scythePlayer", "/assets/images/scythePlayer.png");
        this.load.image("scytheSword", "/assets/images/scytheSword.png");
        this.load.image("angelPlayer", "/assets/images/angelPlayer.png");
        this.load.image("angelSword", "/assets/images/sword.png");
        this.load.image("neonPlayer", "/assets/images/neonPlayer.png");
        this.load.image("neonSword", "/assets/images/neonSword.png");
        this.load.image("berserkerPlayer", "/assets/images/berserkerSkin.png");
        this.load.image("berserkerSword", "/assets/images/devilSword.png");
        this.load.image("tankPlayer", "/assets/images/tankSkin.png");
        this.load.image("tankSword", "/assets/images/sword.png");
        this.load.image("background", "/assets/images/background.jpeg");
        this.load.image("coin", "/assets/images/coin.png");
        this.load.image("chest", "/assets/images/chest.png");
        this.load.image("kill", "/assets/images/kill.png");
        this.load.image("hitParticle", "/assets/images/hitparticle.png");
        this.load.image("starParticle", "/assets/images/star.png");
        this.load.image("bush", "/assets/images/bush.png");
        
        this.load.image("chatbtn", "/assets/images/chat.png");
        this.load.image("throwbtn", "/assets/images/throw.png");
        this.load.image("loginbtn", "/assets/images/login.png");
        this.load.image("signupbtn", "/assets/images/signup.png");
        this.load.image("playAgainBtn", "/assets/images/playAgain.png");
        this.load.image("settingsBtn", "/assets/images/settingsBtn.png");
        this.load.image("shopBtn", "/assets/images/shop.png");
        this.load.image("abilityBtn", "/assets/images/ability.png");

        this.load.audio("coin", "/assets/sound/coin.m4a");
        this.load.audio("damage", "/assets/sound/damage.mp3");
        this.load.audio("hit", "/assets/sound/hitenemy.wav");
        this.load.audio("winSound", "/assets/sound/win.m4a");
        this.load.audio("loseSound", "/assets/sound/lost.mp3");
        this.load.audio("chestOpen", "/assets/sound/chest.wav");

        this.load.image("opening", "/assets/images/opening.png");
        this.load.html("title", "/title.html");
        this.load.html("promo", "/promo.html");
        this.load.html("login", "/login.html");
        this.load.html("shop", "/shop");
        this.load.html("signup", "/signup.html");
        this.load.html("dropdown", "/dropdown.html");
        this.load.html("footer", "/footer.html");
        this.load.html("settings", "/settings.html");
        this.load.html("chat", "/chatbox.html");
        this.load.audio("openingsound", "/assets/sound/opening.mp3");


        this.scale.fullscreenTarget = document.getElementById("game");
        console.timeEnd("load");
  
    }

    create() {
    
             this.scene.stop();
             this.scene.start("title");
    }
    update() {
    
    }
}

export default OpenScene;