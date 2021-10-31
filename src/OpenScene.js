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
    }

    create() {
        this.go = false
        this.background = this.add.rectangle(0, 0, window.innerWidth, window.innerHeight, 0x000000).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Click to join the game..', {
            fontSize: '64px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        this.text.setAlpha(0)
        ///resize dynamicly
        const resize = () => {
            try {
            this.game.scale.resize(window.innerWidth, window.innerHeight)
            this.background.height = window.innerHeight
            this.background.width = window.innerWidth
            
            
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
        this.text.x = (window.innerWidth / 2)
        this.text.y = (window.innerHeight / 2)
        this.text.setFontSize(window.innerWidth * 128 / 1920)
        if(!this.go) {
        if(this.text.alpha < 1) this.text.setAlpha(this.text.alpha + 0.01)
        } else {
            if(this.text.alpha > 0 )this.text.setAlpha(this.text.alpha - 0.05)
            else this.scene.start('title')
        }
    }
}

export default OpenScene;