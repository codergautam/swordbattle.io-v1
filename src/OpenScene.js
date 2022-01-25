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
        this.load.plugin("rexvirtualjoystickplugin",    "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js", true);
        this.load.plugin("rexbbcodetextplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js", true);

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
        this.load.image("foxPlayer", "/assets/images/foxPlayer.png");
        this.load.image("foxSword", "/assets/images/devilSword.png");
        this.load.image("background", "/assets/images/background.jpeg");
        this.load.image("coin", "/assets/images/coin.png");
        this.load.image("kill", "/assets/images/kill.png");
        this.load.image("hitParticle", "/assets/images/hitparticle.png");

        this.load.audio("coin", "/assets/sound/coin.m4a");
        this.load.audio("damage", "/assets/sound/damage.mp3");
        this.load.audio("hit", "/assets/sound/hitenemy.wav");
        this.load.audio("winSound", "/assets/sound/win.m4a");
        this.load.audio("loseSound", "/assets/sound/lost.mp3");

        this.load.image("opening", "/assets/images/opening.png");
        this.load.html("title", "/title.html");
        this.load.html("promo", "/promo.html");
        this.load.html("footer", "/footer.html");
        this.load.audio("openingsound", "/assets/sound/opening.mp3");

        this.scale.fullscreenTarget = document.getElementById("game");
    }

    create() {
        this.go = false;
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x000000).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2, "Click to join the game..", {
            fontSize: "64px",
            fill: "#FFFFFF"
        }).setOrigin(0.5);
        this.text.setAlpha(0);
        ///resize dynamicly
        const resize = () => {
            try {
            this.game.scale.resize(document.documentElement.clientWidth, document.documentElement.clientHeight);
            this.background.height = document.documentElement.clientHeight;
            this.background.width = document.documentElement.clientWidth;
            
            
        } catch(e) {
            console.log(e);
        }
        };
        window.addEventListener("resize", resize, true);
        this.input.on("pointerdown", event => {
            this.go = true;
        });
    }

    update() {
        this.text.x = (document.documentElement.clientWidth / 2);
        this.text.y = (document.documentElement.clientHeight / 2);
        this.text.setFontSize(document.documentElement.clientWidth * 128 / 1920);
        if(!this.go) {
        if(this.text.alpha < 1) this.text.setAlpha(this.text.alpha + 0.01);
        } else {
            if(this.text.alpha > 0 )this.text.setAlpha(this.text.alpha - 0.05);
            else {
                try {
                this.scale.startFullscreen();
                } catch(e) {
                    console.log("fullscreen error oof");
                }
                this.scene.start("title");
            }
        }
    }
}

export default OpenScene;