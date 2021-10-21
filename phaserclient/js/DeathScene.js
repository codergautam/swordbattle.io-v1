function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
  
    return (hours == "00"?"": hours+"h ") + (minutes == "00"?"": minutes+"m ") + seconds+"s";
  }

class DeathScene extends Phaser.Scene {
    constructor(callback) {
        super()
        this.callback = callback
    }
    preload() {
        this.load.image('background', '/assets/images/background.jpeg');
    }

    create() {

        this.background = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background').setOrigin(0).setScrollFactor(0, 0);
        this.text = this.add.text(window.innerWidth / 2, 0, 'You died', {
            fontSize: '64px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.displayTime = 0;
        this.displayKills = 0;
        console.log(this.data.timeSurvived)
        this.timeUpdateDelay = 5000 / this.data.timeSurvived
        this.lastUpdateTime = Date.now() 

        this.displayKills = (this.data.kills == 1 ? 1 : 0);
        this.killUpdateDelay = 2000 / this.data.kills
        this.lastUpdateKills = Date.now() 

        this.stats = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Killed by: '+this.data.killedBy+`\nSurvived Time: 0s\nKills: ${this.displayKills}`, {
            fontSize: '48px',
            fill: '#000000'
        }).setOrigin(0.5);


        this.btnrect = this.add.rectangle(0, 0, 0, 0, 0x6666ff);
        this.btntext = this.add.text(window.innerWidth / 2, window.innerHeight / 1.2, 'Play Again', {
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
        this.text.setFontSize(window.innerWidth / 10)
        this.stats.setFontSize(window.innerWidth / 20)
        this.btntext.setFontSize(window.innerWidth / 25)
        if (this.text.y < window.innerHeight / 4) this.text.y += 10

        if(this.displayKills < this.data.kills ) {
            this.displayKills += 1
            this.lastUpdateKills = Date.now()
        }

        if(this.displayTime < this.data.timeSurvived) {
            this.displayTime += 1000
            
        }

        this.stats.setText(`Killed by: ${this.data.killedBy}\nSurvived Time: ${msToTime(this.displayTime)}\nKills: ${this.displayKills}`)
        const resize = () => {
            this.game.scale.resize(window.innerWidth, window.innerHeight)
            this.background.width = window.innerWidth
            this.background.height = window.innerHeight
            this.text.x = window.innerWidth / 2
            this.text.y = window.innerHeight / 4
            this.stats.x = window.innerWidth / 2
            this.stats.y = window.innerHeight / 2
            
            this.btntext.x = window.innerWidth / 2
            this.btntext.y = window.innerHeight / 1.2


            //this.stats.y -= this.stats.height
        }
        this.btnrect.x = this.btntext.x - (this.btntext.width/2) - 5
        this.btnrect.y = this.btntext.y - (this.btntext.height/2) - 5
        this.btnrect.width = this.btntext.width + 10
        this.btnrect.height = this.btntext.height + 10
        window.addEventListener("resize", resize, false);

    }
}

export default DeathScene;