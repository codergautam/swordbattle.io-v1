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
        this.load.image("bush", "/assets/images/bush.png");

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
        this.load.html("chat", "/chatbox.html");
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

      
          

            if(!this.e) {
                this.euRect.destroy();
                this.usRect.destroy();
                
                this.euText.destroy();
                this.usText.destroy();
               

                this.euRect = this.add.rectangle(this.canvas.width/3*2, this.canvas.height/2, this.canvas.width/4, this.canvas.height/2, 0xFFFFFF);
                this.usRect = this.add.rectangle(this.canvas.width/3, this.canvas.height/2, this.canvas.width/4, this.canvas.height/2, 0xFFFFFF);
                
                this.euRect.setInteractive();
                this.usRect.setInteractive();
                
                this.euText = this.add.rexBBCodeText(this.canvas.width/3*2, (this.canvas.height/2)- (this.euRect.height/2), `[color=black][align=center]Europe\n\n${this.data.eu.playerCount}/${this.data.eu.maxPlayers}\n\n${this.data.eu.lag}\nPing: ${this.data.eu.ping}[/align][/color]`).setFontSize(this.canvas.width/30).setOrigin(0.5,0);
        
                this.usText = this.add.rexBBCodeText(this.canvas.width/3, (this.canvas.height/2)- (this.usRect.height/2), `[color=black][align=center]USA\n\n${this.data.us.playerCount}/${this.data.us.maxPlayers}\n\n${this.data.us.lag}\nPing: ${this.data.us.ping}[/align][/color]`).setFontSize(this.canvas.width/30).setOrigin(0.5,0);

                this.euText.y += ((this.euRect.height/2) - (this.euText.height/2));
                this.usText.y += ((this.usRect.height/2) - (this.usText.height/2));
                this.euRect.on("pointerdown", event => {
                   this.server = "eu";
                   this.scene.stop();
                   this.scene.start("title");
                });
                this.usRect.on("pointerdown", event => {
                    this.server = "us";
                    this.scene.stop();
                    this.scene.start("title");
                 });
            } 
            
            
            
            
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
        
        if(this.euRect && this.euRect.visible) {
            this.euRect.destroy();
            this.usRect.destroy();
        }
        this.loadText.destroy();
        this.euRect = this.add.rectangle(this.canvas.width/3*2, this.canvas.height/2, this.canvas.width/4, this.canvas.height/2, 0xFFFFFF);
        this.usRect = this.add.rectangle(this.canvas.width/3, this.canvas.height/2, this.canvas.width/4, this.canvas.height/2, 0xFFFFFF);
        
        this.euText = this.add.rexBBCodeText(this.canvas.width/3*2, (this.canvas.height/2)- (this.euRect.height/2), "[color=black][align=center]Europe\n\n0/0\n\nConnecting..[/align][/color]").setFontSize(this.canvas.width/30).setOrigin(0.5,0);


        this.usText = this.add.rexBBCodeText(this.canvas.width/3, (this.canvas.height/2)- (this.usRect.height/2), "[color=black][align=center]USA\n\n0/0\n\nConnecting..[/align][/color]").setFontSize(this.canvas.width/30).setOrigin(0.5,0);
        this.euText.y += ((this.euRect.height/2) - (this.euText.height/2));
        this.usText.y += ((this.usRect.height/2) - (this.usText.height/2));
        var euUrl = "swordbattle.herokuapp.com";
        var naUrl = "swordbattle.codergautamyt.repl.co";
        var time = Date.now();
        this.data = {};
       
       try {
         var eu = await axios.get(`https://${euUrl}/api/serverinfo`).catch((e) => {
            this.data.eu = {error: true};
         });
         this.data.eu = eu.data;
         this.data.eu.ping = Date.now() - time;
       } catch(e) {
        this.data.eu = {error: true};
       }

       time = Date.now();
       try {
        var us = await    axios.get(`https://${naUrl}/api/serverinfo`).catch((e) => {
            this.data.us = {error: true};
    });
      
            this.data.us = us.data;
            this.data.us.ping = Date.now() - time;
         
        }
        catch(e) {
            this.data.us = {error: true};
        }
        

        this.euRect.setInteractive();
        this.usRect.setInteractive();
        if(this.data.eu.error) this.euText.setText("[color=red][align=center]Europe\n\nOffline[/align][/color]");
        else this.euText.setText(`[color=black][align=center]Europe\n\n${this.data.eu.playerCount}/${this.data.eu.maxPlayers}\n\n${this.data.eu.lag}\nPing: ${this.data.eu.ping}[/align][/color]`);

        if(this.data.us.error) this.usText.setText("[color=red][align=center]USA\n\nOffline[/align][/color]");
        else this.usText.setText(`[color=black][align=center]USA\n\n${this.data.us.playerCount}/${this.data.us.maxPlayers}\n\n${this.data.us.lag}\nPing: ${this.data.us.ping}[/align][/color]`);
  
        this.usText.y = (this.canvas.height/2) - (this.usRect.height/2);
        this.euText.y = (this.canvas.height/2) - (this.euRect.height/2);
        this.euText.y += ((this.euRect.height/2) - (this.euText.height/2));
        this.usText.y += ((this.usRect.height/2) - (this.usText.height/2));


        this.euRect.on("pointerdown", event => {
            if(this.data.eu.error) return;
            this.server = "eu";
            this.scene.stop();
            this.scene.start("title");
         });
         this.usRect.on("pointerdown", event => {
             if(this.data.us.error) return;
             this.server = "us";
             this.scene.stop();
             this.scene.start("title");
          });
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

     
                if(this.e) {
                    this.e = false;
              
                this.showServerSelector();
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