function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
  
    return (hours == "00"?"": hours+"h ") + (minutes == "00"?"": minutes+"m ") + seconds+"s";
  }

class OpenScene extends Phaser.Scene {
    constructor(callback) {
        super()
        this.callback = callback
    }
    preload() {
        this.load.plugin("rexvirtualjoystickplugin",    "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js", true);
        this.load.image("playerPlayer", "/assets/images/player.png");
        this.load.image("playerSword", "/assets/images/sword.png");
        this.load.image("codergautamytPlayer", "/assets/images/codergautamytPlayer.png");
        this.load.image("codergautamytSword", "/assets/images/codergautamytSword.png");
        this.load.image("devilPlayer", "/assets/images/devilPlayer.png");
        this.load.image("devilSword", "/assets/images/devilSword.png");
        this.load.image('background', '/assets/images/background.jpeg');
        this.load.image('coin', '/assets/images/coin.png');

        this.load.audio('coin', '/assets/sound/coin.m4a');
        this.load.audio('damage', '/assets/sound/damage.mp3');
        this.load.audio('hit', '/assets/sound/hitenemy.wav');
        this.load.audio('winSound', '/assets/sound/win.m4a');
        this.load.audio('loseSound', '/assets/sound/lost.mp3');
    }

    create() {
        this.go = false
        this.background = this.add.rectangle(0, 0, window.visualViewport.width, window.visualViewport.height, 0x000000).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(window.visualViewport.width / 2, window.visualViewport.height / 2, 'Click to join the game..', {
            fontSize: '64px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        this.text.setAlpha(0)
        ///resize dynamicly
        const resize = () => {
            try {
            this.game.scale.resize(window.visualViewport.width, window.visualViewport.height)
            this.background.height = window.visualViewport.height
            this.background.width = window.visualViewport.width
            
            
        } catch(e) {
            console.log(e)
        }
        }
        window.addEventListener("resize", resize, true)
        this.input.on("pointerdown", event => {
            this.go = true
        });
    }

    update() {
        this.text.x = (window.visualViewport.width / 2)
        this.text.y = (window.visualViewport.height / 2)
        this.text.setFontSize(window.visualViewport.width * 128 / 1920)
        if(!this.go) {
        if(this.text.alpha < 1) this.text.setAlpha(this.text.alpha + 0.01)
        } else {
            if(this.text.alpha > 0 )this.text.setAlpha(this.text.alpha - 0.05)
            else this.scene.start('title')
        }
    }
}

export default OpenScene;