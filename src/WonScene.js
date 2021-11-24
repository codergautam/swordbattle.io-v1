function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
  
    return (hours == "00"?"": hours+"h ") + (minutes == "00"?"": minutes+"m ") + seconds+"s";
  }

class WonScene extends Phaser.Scene {
    constructor(callback) {
        super()
        this.callback = callback
    }
    preload() {
    }

    create() {

        this.background = this.add.rectangle(0, 0, document.documentElement.clientHeight, document.documentElement.clientWidth, 0x90ee90).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(document.documentElement.clientWidth / 2, 0, 'You won!', {
            fontSize: '64px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.displayTime = 0;
        this.displayKills = 0;

        this.timeUpdateDelay = 5000 / this.data.timeSurvived
        this.lastUpdateTime = Date.now() 

        this.displayKills = (this.data.kills == 1 ? 1 : 0);
        this.displayCoins = 0

        this.stats = this.add.text(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2, `You conquered the map and became Ka-HUGE!\nTime Taken: 0s\nKills: ${this.displayKills}`, {
            fontSize: '48px',
            fill: '#000000'
        }).setOrigin(0.5);


        this.btnrect = this.add.rectangle(0, 0, 0, 0, 0x6666ff);
        this.btntext = this.add.text(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 1.2, 'Play Again', {
            fontSize: '48px',
            fill: '#000000'
        }).setOrigin(0.5);
        this.btnrect.x = this.btntext.x - (this.btntext.width/2) - 5
        this.btnrect.y = this.btntext.y - (this.btntext.height/2) - 5
        this.btnrect.width = this.btntext.width + 10
        this.btnrect.height = this.btntext.height + 10
        //this.stats.y -= this.stats.height
        this.btnrect.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
            this.scene.start('title')
        });
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.returnKey.on("down", event => {
            this.scene.start('title')
        });
    }

    update() {
        this.text.setFontSize(document.documentElement.clientWidth / 10)
        this.stats.setFontSize(document.documentElement.clientWidth / 30)
        this.btntext.setFontSize(document.documentElement.clientWidth / 25)
        if (this.text.y < document.documentElement.clientHeight / 4) this.text.y += 10

        if(this.displayKills < this.data.kills ) {
            this.displayKills += 1
            this.lastUpdateKills = Date.now()
        }

        if(this.displayTime < this.data.timeSurvived) {
            this.displayTime += 1000
            
        }
        if(this.displayCoins < this.data.coins) {
            this.displayCoins += 1000
            
        }

        this.stats.setText(`You conquered the map and became Ka-HUGE!\nTime Taken: ${msToTime(this.displayTime)}\nCoins: ${this.displayCoins}\nKills: ${this.displayKills}`)
        const resize = () => {
            this.game.scale.resize(document.documentElement.clientWidth, document.documentElement.clientHeight)
            this.background.width = document.documentElement.clientWidth
            this.background.height = document.documentElement.clientHeight
            this.text.x = document.documentElement.clientWidth / 2
            this.text.y = document.documentElement.clientHeight / 4
            this.stats.x = document.documentElement.clientWidth / 2
            this.stats.y = document.documentElement.clientHeight / 2
            
            this.btntext.x = document.documentElement.clientWidth / 2
            this.btntext.y = document.documentElement.clientHeight / 1.2


            //this.stats.y -= this.stats.height
        }
        this.btnrect.x = this.btntext.x - (this.btntext.width/2) - 5
        this.btnrect.y = this.btntext.y - (this.btntext.height/2) - 5
        this.btnrect.width = this.btntext.width + 10
        this.btnrect.height = this.btntext.height + 10
        window.addEventListener("resize", resize, false);

    }
}

export default WonScene;