import ImgButton from "./PhaserImgButton";


function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
  
    return (hours == "00"?"": hours+"h ") + (minutes == "00"?"": minutes+"m ") + seconds+"s";
  }

class DeathScene extends Phaser.Scene {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    preload() {


  window.onbeforeunload = ()=>{};
    }

    create() {
        this.lerp = function (start, end, amt){
            return (1-amt)*start+amt*end;
          };
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x90ee90).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(document.documentElement.clientWidth / 2, 0, "You died", {
            fontSize: "64px",
            fill: "#000000"
        }).setOrigin(0.5);

        this.displayTime = 0;
        this.displayKills = 0;

        this.timeUpdateDelay = 5000 / this.data.timeSurvived;
        this.lastUpdateTime = Date.now(); 

        this.displayKills = (this.data.kills == 1 ? 1 : 0);
        this.displayCoins = 0;

        this.stats = this.add.rexBBCodeText(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2, "Killed by: "+(this.data.killerVerified?"[area=u][color=blue][u]":"")+this.data.killedBy+(this.data.killerVerified?"[/u][/color][/area]":"")+`\nSurvived Time: 0s\nKills: ${this.displayKills}`, {
            fontSize: "48px",
            fill: "#000000"
        }).setOrigin(0.5).setInteractive().on("areaup",  (k)=> {
            window.open(`/${this.data.killedBy}`, "_blank");
        });


      this.playAgain = new ImgButton(this, 0,0, "playAgainBtn",()=>{
          this.scene.start("title");
      });
      this.playAgain.btn.setScale(0.2);
    
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.returnKey.on("down", event => {
            this.scene.start("title");
        });
    }

    update() {
        this.text.setFontSize(document.documentElement.clientWidth / 10);
        this.stats.setFontSize(document.documentElement.clientWidth / 20);
   
        if (this.text.y < document.documentElement.clientHeight / 5.5) this.text.y = this.lerp(this.text.y, document.documentElement.clientHeight / 5.5, 0.2 );

        if(this.displayKills < this.data.kills ) {
            this.displayKills += 1;
            this.lastUpdateKills = Date.now();
        }

        if(this.displayTime < this.data.timeSurvived) {
            this.displayTime = Math.round(this.lerp(this.displayTime, this.data.timeSurvived, 0.1));
        }
        if(this.displayCoins < this.data.coins) {
            this.displayCoins = Math.round(this.lerp(this.displayCoins, this.data.coins, 0.1));
            if(this.data.coins - 4 == this.displayCoins) this.displayCoins = this.data.coins;
        }


        this.stats.setText("Killed by: "+(this.data.killerVerified?"[area=u][color=blue][u]":"")+this.data.killedBy+(this.data.killerVerified?"[/u][/color][/area]":"")+`\nSurvived Time: ${msToTime(this.displayTime)}\nCoins: ${this.displayCoins}\nKills: ${this.displayKills}`);
           
        const convert = (num, val, newNum) => (newNum * val) / num;
        const resize = () => {
            this.game.scale.resize(document.documentElement.clientWidth, document.documentElement.clientHeight);
            this.background.width = document.documentElement.clientWidth;
            this.background.height = document.documentElement.clientHeight;
            this.text.x = document.documentElement.clientWidth / 2;
            this.text.y = document.documentElement.clientHeight / 5.5;
            this.stats.x = document.documentElement.clientWidth / 2;
            this.stats.y = document.documentElement.clientHeight / 2;
        

            this.playAgain.btn.setScale(convert(1280, 0.15, document.documentElement.clientWidth));
            this.playAgain.update(document.documentElement.clientWidth / 2,  document.documentElement.clientHeight / 1.2);
            this.playAgain.btn.x -= this.playAgain.btn.displayWidth / 2;
            this.playAgain.btn.y -= this.playAgain.btn.displayHeight / 2;


            //this.stats.y -= this.stats.height
        };
        resize();
        window.addEventListener("resize", resize, false);

    }
}

export default DeathScene;