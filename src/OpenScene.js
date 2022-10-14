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
    setLoad(load) {
    }
    preload() {
      try {
        if(this.mobile) {
          document.getElementsByClassName("grecaptcha-badge")[0].style.transform = "scale(0)";
          document.getElementsByClassName("grecaptcha-badge")[0].style.transformOrigin = "0 0";
        }
      }
      catch(e) {
        console.log("captcha hide fail", e);
      }
      console.time("load");
        this.e = true;
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x008800).setOrigin(0).setScrollFactor(0, 0).setScale(2);
   this.loadText =  this.add.text(0,0,"Loading").setOrigin(0.5,0.5);
   this.progressText = this.add.text(0,0,"please wait.").setOrigin(0.5,0.5);
      
      this.loadText.setFontSize(this.canvas.width/20);
      this.progressText.setFontSize(this.canvas.width/40);
      this.loadText.x = this.canvas.width/2;
      this.loadText.y = this.canvas.height/2;
      this.progressText.x = this.canvas.width/2;
      this.progressText.y = this.canvas.height/2 + this.canvas.height/10;
      this.load.on("fileprogress", function(file, progress){
        // var key = file.key;
        var loader = this.load;
var total = loader.totalToLoad;
var remainder = loader.list.size + loader.inflight.size;
var progress = 1 - (remainder / total);
        this.progressText.setText((progress*100).toFixed(1)+"%");
    }, this);
        this.load.plugin("rexvirtualjoystickplugin",    "/joystick.js", true);
        this.load.plugin("rexbbcodetextplugin", "/textplus.js", true);

        this.load.image("playerPlayer", "/assets/images/player.png");
        this.load.image("playerSword", "/assets/images/sword.png");
        this.load.image("tigerPlayer", "/assets/images/tigerPlayer.png");
        this.load.image("tigerSword", "/assets/images/tigerSword.png");
        this.load.image("beachPlayer", "/assets/images/beachPlayer.png");
        this.load.image("beachSword", "/assets/images/beachSword.png");
        this.load.image("birdPlayer", "/assets/images/birdPlayer.png");
        this.load.image("birdSword", "/assets/images/birdSword.png");
        this.load.image("cactusPlayer", "/assets/images/cactusPlayer.png");
        this.load.image("cactusSword", "/assets/images/cactusSword.png");
        this.load.image("killerbotPlayer", "/assets/images/killerbotPlayer.png");
        this.load.image("killerbotSword", "/assets/images/killerbotSword.png");
        this.load.image("matrixPlayer", "/assets/images/matrixPlayer.png");
        this.load.image("matrixSword", "/assets/images/matrixSword.png");
        this.load.image("musicPlayer", "/assets/images/musicPlayer.png");
        this.load.image("musicSword", "/assets/images/musicSword.png");
        this.load.image("smilePlayer", "/assets/images/smilePlayer.png");
        this.load.image("smileSword", "/assets/images/smileSword.png");
        this.load.image("spongePlayer", "/assets/images/spongePlayer.png");
        this.load.image("spongeSword", "/assets/images/spongeSword.png");
        this.load.image("zombiePlayer", "/assets/images/zombiePlayer.png");
        this.load.image("zombieSword", "/assets/images/zombieSword.png");
        this.load.image("codergautamytPlayer", "/assets/images/codergautamytPlayer.png");
        this.load.image("codergautamytSword", "/assets/images/codergautamytSword.png");
        this.load.image("devilPlayer", "/assets/images/devilPlayer.png");
        this.load.image("devilSword", "/assets/images/devilSword.png");
        this.load.image("mysteryPlayer", "/assets/images/mysteryPlayer.png");
        this.load.image("mysterySword", "/assets/images/mysterySword.png");
        this.load.image("lightningPlayer", "/assets/images/lightningPlayer.png");
        this.load.image("lightningSword", "/assets/images/lightningSword.png");
        this.load.image("patchworkPlayer", "/assets/images/patchworkPlayer.png");
        this.load.image("patchworkSword", "/assets/images/patchworkSword.png");
        this.load.image("winterPlayer", "/assets/images/winterPlayer.png");
        this.load.image("winterSword", "/assets/images/winterSword.png");
        this.load.image("chefPlayer", "/assets/images/chefPlayer.png");
        this.load.image("chefSword", "/assets/images/chefSword.png");
        this.load.image("medicPlayer", "/assets/images/medicPlayer.png");
        this.load.image("medicSword", "/assets/images/medicSword.png");
        this.load.image("lavaPlayer", "/assets/images/lavaPlayer.png");
        this.load.image("lavaSword", "/assets/images/lavaSword.png");
        this.load.image("radiationPlayer", "/assets/images/radiationPlayer.png");
        this.load.image("radiationSword", "/assets/images/radiationSword.png");
        this.load.image("ninjaPlayer", "/assets/images/ninjaPlayer.png");
        this.load.image("ninjaSword", "/assets/images/ninjaSword.png");
        this.load.image("hackerPlayer", "/assets/images/hackerPlayer.png");
        this.load.image("hackerSword", "/assets/images/hackerSword.png");
        this.load.image("mitbladeSword", "/assets/images/mitbladeSword.png");
        this.load.image("mitbladePlayer", "/assets/images/mitbladePlayer.png");
        this.load.image("bowlingPlayer", "/assets/images/bowlingPlayer.png");
        this.load.image("bowlingSword", "/assets/images/bowlingSword.png");
        this.load.image("blueberryPlayer", "/assets/images/bluerberryPlayer.png");
        this.load.image("blueberrySword", "/assets/images/blueberrySword.png");
        this.load.image("chickenPlayer", "/assets/images/chickenPlayer.png");
        this.load.image("chickenSword", "/assets/images/chickenSword.png");
        this.load.image("dinnerPlayer", "/assets/images/dinnerPlayer.png");
        this.load.image("dinnerSword", "/assets/images/dinnerSword.png");
        this.load.image("fallPlayer", "/assets/images/fallPlayer.png");
        this.load.image("fallSword", "/assets/images/fallSword.png");
        this.load.image("hotairPlayer", "/assets/images/hotairPlayer.png");
        this.load.image("hotairSword", "/assets/images/hotairSword.png");
        this.load.image("piratePlayer", "/assets/images/piratePlayer.png");
        this.load.image("pirateSword", "/assets/images/pirateSword.png");
        this.load.image("reaperPlayer", "/assets/images/reaperPlayer.png");
        this.load.image("reaperSword", "/assets/images/reaperSword.png");
        this.load.image("sadPlayer", "/assets/images/sadPlayer.png");
        this.load.image("sadSword", "/assets/images/sadSword.png");
        this.load.image("starrynightPlayer", "/assets/images/starrynightPlayer.png");
        this.load.image("starrynightSword", "/assets/images/starrynightSword.png");
        this.load.image("superheroPlayer", "/assets/images/superheroPlayer.png");
        this.load.image("superheroSword", "/assets/images/superheroSword.png");
  
        // samurai evolution
        this.load.image("samuraiPlayer", "/assets/images/samuraiSkin.png");
        // warrior evolution
        this.load.image("warriorPlayer", "/assets/images/warriorSkin.png");
        // knight evolution
        this.load.image("knightPlayer", "/assets/images/knightSkin.png");

        // vampire evolution
        this.load.image("vampirePlayer", "/assets/images/vampireSkin.png");
        // rook evolution
        this.load.image("rookPlayer", "/assets/images/rookSkin.png");

        this.load.image("bullseyePlayer", "/assets/images/bullseyePlayer.png");
        this.load.image("bullseyeSword", "/assets/images/bullseyeSword.png");
        this.load.image("cheesePlayer", "/assets/images/cheesePlayer.png");
        this.load.image("cheeseSword", "/assets/images/cheeseSword.png");
        this.load.image("demonPlayer", "/assets/images/demonPlayer.png");
        this.load.image("demonSword", "/assets/images/demonSword.png");
        this.load.image("honeycombPlayer", "/assets/images/honeycombPlayer.png");
        this.load.image("honeycombSword", "/assets/images/honeycombSword.png");
        this.load.image("pandaPlayer", "/assets/images/pandaPlayer.png");
        this.load.image("pandaSword", "/assets/images/pandaSword.png");
        this.load.image("scorpionPlayer", "/assets/images/scorpionPlayer.png");
        this.load.image("scorpionSword", "/assets/images/scorpionSword.png");
        this.load.image("soldierPlayer", "/assets/images/soldierPlayer.png");
        this.load.image("soldierSword", "/assets/images/soldierSword.png");
        this.load.image("stormPlayer", "/assets/images/stormPlayer.png");
        this.load.image("stormSword", "/assets/images/stormSword.png");
        this.load.image("foxPlayer", "/assets/images/foxPlayer.png");
        this.load.image("foxSword", "/assets/images/foxSword.png");
        this.load.image("vortexPlayer", "/assets/images/vortexPlayer.png");
        this.load.image("vortexSword", "/assets/images/vortexSword.png");
        this.load.image("springPlayer", "/assets/images/springPlayer.png");
        this.load.image("springSword", "/assets/images/springSword.png");
        this.load.image("scythePlayer", "/assets/images/scythePlayer.png");
        this.load.image("scytheSword", "/assets/images/scytheSword.png");
        this.load.image("angelPlayer", "/assets/images/angelPlayer.png");
        this.load.image("angelSword", "/assets/images/angelSword.png");
        this.load.image("breadPlayer", "/assets/images/breadPlayer.png");
        this.load.image("breadSword", "/assets/images/breadSword.png");
        this.load.image("cookiePlayer", "/assets/images/cookiePlayer.png");
        this.load.image("cookieSword", "/assets/images/cookieSword.png");
        this.load.image("neonPlayer", "/assets/images/neonPlayer.png");
        this.load.image("neonSword", "/assets/images/neonSword.png");


        this.load.image("berserkerPlayer", "/assets/images/berserkerSkin.png");
        this.load.image("tankPlayer", "/assets/images/tankSkin.png");
        // warrior evolution
        this.load.image("warriorPlayer", "/assets/images/warriorSkin.png");
        // knight evolution
        this.load.image("knightPlayer", "/assets/images/knightSkin.png");

        // vampire evolution
        this.load.image("vampirePlayer", "/assets/images/vampireSkin.png");
        // rook evolution
        this.load.image("rookPlayer", "/assets/images/rookSkin.png");


        this.load.image("seaPlayer", "/assets/images/seaPlayer.png");
        this.load.image("seaSword", "/assets/images/seaSword.png");
        this.load.image("assasinPlayer", "/assets/images/assasinPlayer.png");
        this.load.image("assasinSword", "/assets/images/assasinSword.png");

        // astronaut player & sword
        this.load.image("astronautPlayer", "/assets/images/astronautPlayer.png");
        this.load.image("astronautSword", "/assets/images/astronautSword.png");

        //bubble player and sword
        this.load.image("bubblePlayer", "/assets/images/bubblePlayer.png");
        this.load.image("bubbleSword", "/assets/images/bubbleSword.png");

        // cyborg player and sword
        this.load.image("cyborgPlayer", "/assets/images/cyborgPlayer.png");
        this.load.image("cyborgSword", "/assets/images/cyborgSword.png");

        // emerald player and sword
        this.load.image("emeraldPlayer", "/assets/images/emeraldPlayer.png");
        this.load.image("emeraldSword", "/assets/images/emeraldSword.png");

        //glitch player and sword
        this.load.image("glitchPlayer", "/assets/images/glitchPlayer.png");
        this.load.image("glitchSword", "/assets/images/glitchSword.png");

        //dragon player and sword
        this.load.image("dragonPlayer", "/assets/images/dragonPlayer.png");
        this.load.image("dragonSword", "/assets/images/dragonSword.png");

        //devex player and sword
        this.load.image("devexPlayer", "/assets/images/devexPlayer.png");
        this.load.image("devexSword", "/assets/images/devexSword.png");

        //bush player and sword
        this.load.image("bushPlayer", "/assets/images/bushPlayer.png");
        this.load.image("bushSword", "/assets/images/bushSword.png");
      


        this.load.image("background", "/assets/images/background.jpeg");
        this.load.image("coin", "/assets/images/coin.png");

        this.load.image("chest", "/assets/images/chests/chest.png");
        this.load.image("epicChest", "/assets/images/chests/epicChest.png");
        this.load.image("legendaryChest", "/assets/images/chests/legendaryChest.png");
        this.load.image("mythicalChest", "/assets/images/chests/mythicalChest.png");
        this.load.image("rareChest", "/assets/images/chests/rareChest.png");
        this.load.image("uncommonChest", "/assets/images/chests/uncommonChest.png");

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
        this.load.audio("chestHit", "/assets/sound/chesthit.wav");


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
