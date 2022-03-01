import axios from "axios";

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
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x008800).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2, "Loading.. 0%", {
            fontSize: "64px",
            fill: "#FFFFFF"
        }).setOrigin(0.5);
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
        this.load.image("indiaPlayer", "/assets/images/indiaPlayer.png");
        this.load.image("indiaSword", "/assets/images/indiaSword.png");
        this.load.image("shoePlayer", "/assets/images/shoePlayer.png");
        this.load.image("shoeSword", "/assets/images/shoeSword.png");
        this.load.image("foxPlayer", "/assets/images/foxPlayer.png");
        this.load.image("foxSword", "/assets/images/devilSword.png");
        this.load.image("background", "/assets/images/background.jpeg");
        this.load.image("coin", "/assets/images/coin.png");
        this.load.image("chest", "/assets/images/chest.png");
        this.load.image("kill", "/assets/images/kill.png");
        this.load.image("hitParticle", "/assets/images/hitparticle.png");

        this.load.image("loginbtn", "/assets/images/login.png");
        this.load.image("signupbtn", "/assets/images/signup.png");
        this.load.image("playAgainBtn", "/assets/images/playAgain.png");
        this.load.image("settingsBtn", "/assets/images/settingsBtn.png");
        this.load.image("shopBtn", "/assets/images/shop.png");

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
        this.load.audio("openingsound", "/assets/sound/opening.mp3");


        this.scale.fullscreenTarget = document.getElementById("game");
    }

    create() {


        
        this.go = false;

    
        ///resize dynamicly
        const resize = () => {
            try {
            this.game.scale.resize(document.documentElement.clientWidth, document.documentElement.clientHeight);
            this.background.height = document.documentElement.clientHeight;
            this.background.width = document.documentElement.clientWidth;

            this.text.x = document.documentElement.clientWidth / 2;
            this.text.y = document.documentElement.clientHeight / 2; 
            this.text.setFontSize(this.canvas.width/50);
            
            
        } catch(e) {
            console.log(e);
        }
        };
        window.addEventListener("resize", resize, true);
        this.input.on("pointerdown", event => {
            this.go = true;
        });
        
      this.loadProg = 0;
        this.showProg = 0;
        this.last = 100;
       
    }


    async showServerSelector() {
        var euUrl = "swordbattle.herokuapp.com";
        var naUrl = "swordbattledev.codergautamyt.repl.co";
        var time = Date.now();
        var data = {};
       try {
         var eu = await axios.get(`https://${euUrl}/api/serverinfo`);
        
         data.eu = eu.data;
         data.eu.ping = Date.now() - time;
       } catch(e) {
           data.eu = {error: true};
       }

       time = Date.now();
        var us = await    axios.get(`https://${naUrl}/api/serverinfo`);
        try {
            data.us = us.data;
            data.us.ping = Date.now() - time;
        }
        catch(e) {
            data.us = {error: true};
        }
        console.log(data)

        
    }
    update() {
        /*
        this.text.x = (document.documentElement.clientWidth / 2);
        this.text.y = (document.documentElement.clientHeight / 2);
        this.text.setFontSize(document.documentElement.clientWidth * 128 / 1920);
        if(!this.go) {
        if(this.text.alpha < 1) this.text.setAlpha(this.text.alpha + 0.01);
        } else {
            if(this.text.alpha > 0 )this.text.setAlpha(this.text.alpha - 0.05);
            else this.scene.start("title");
            
        }
        */

        this.loadProg = Math.round(this.load.progress * 100);
        
        if(this.loadProg > this.showProg) {
            this.showProg+= Math.round((this.loadProg - this.showProg) / 10);
            if(this.showProg == this.last) {
                if(this.text && this.text.visible) {
                    console.log(
                    'avc'
                    )
                    this.text.destroy();
                this.showServerSelector();
                }
            }
            else this.last = this.showProg;
            this.text.setText("Loading.. " + this.showProg + "%");
        }
   
            
          //  this.loadProg = newProg;
        
                /*
        if(this.text.text === "Loading.. 100%") {
            this.scene.stop();
            this.scene.start("title");
        }
        */
    }
}

export default OpenScene;