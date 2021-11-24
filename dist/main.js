/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/DeathScene.js":
/*!***************************!*\
  !*** ./src/DeathScene.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
    }

    create() {
        this.lerp = function (start, end, amt){
            return (1-amt)*start+amt*end
          }
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x90ee90).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(document.documentElement.clientWidth / 2, 0, 'You died', {
            fontSize: '64px',
            fill: '#000000'
        }).setOrigin(0.5);

        this.displayTime = 0;
        this.displayKills = 0;

        this.timeUpdateDelay = 5000 / this.data.timeSurvived
        this.lastUpdateTime = Date.now() 

        this.displayKills = (this.data.kills == 1 ? 1 : 0);
        this.displayCoins = 0

        this.stats = this.add.text(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2, 'Killed by: '+this.data.killedBy+`\nSurvived Time: 0s\nKills: ${this.displayKills}`, {
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
        this.stats.setFontSize(document.documentElement.clientWidth / 20)
        this.btntext.setFontSize(document.documentElement.clientWidth / 25)
        if (this.text.y < document.documentElement.clientHeight / 4.5) this.text.y += 10

        if(this.displayKills < this.data.kills ) {
            this.displayKills += 1
            this.lastUpdateKills = Date.now()
        }

        if(this.displayTime < this.data.timeSurvived) {
            this.displayTime = Math.round(this.lerp(this.displayTime, this.data.timeSurvived, 0.1))
        }
        if(this.displayCoins < this.data.coins) {
            this.displayCoins = Math.round(this.lerp(this.displayCoins, this.data.coins, 0.1))
            
        }


        this.stats.setText(`Killed by: ${this.data.killedBy}\nSurvived Time: ${msToTime(this.displayTime)}\nCoins: ${this.displayCoins}\nKills: ${this.displayKills}`)
        const resize = () => {
            this.game.scale.resize(document.documentElement.clientWidth, document.documentElement.clientHeight)
            this.background.width = document.documentElement.clientWidth
            this.background.height = document.documentElement.clientHeight
            this.text.x = document.documentElement.clientWidth / 2
            this.text.y = document.documentElement.clientHeight / 4.5
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DeathScene);

/***/ }),

/***/ "./src/GameScene.js":
/*!**************************!*\
  !*** ./src/GameScene.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _HealthBar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./HealthBar.js */ "./src/HealthBar.js");


class GameScene extends Phaser.Scene {
    constructor(callback) {
        super()
        this.callback = callback
    }

    preload() {    
         try {       
        document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 0;
         } catch(e) {
             console.log(e)
         }
        this.ready = false;
        this.loadrect = this.add.rectangle(0,0, document.documentElement.clientWidth*2, document.documentElement.clientHeight*2, 0x006400).setDepth(200)
    }

    died(data) {
        this.loseSound.play()
        this.children.list.forEach((b) => {
            b.destroy();
        })
        this.dead = true
        data = Object.assign(data, {name: this.myObj.name, kills: this.myObj.kills, coins: this.myObj.coins})
        this.callback({win:false, data: data})
    }
    win(data) {
        this.winSound.play()
this.dead = true  
data = Object.assign(data, {name: this.myObj.name, kills: this.myObj.kills, coins: this.myObj.coins})
this.callback({win: true, data:data})
    }

    create() {
        this.mobile = false;
        ((a)=>{if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) this.mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
  
        //recaptcha

        grecaptcha.ready(() =>{
            grecaptcha.execute('6LdVxgYdAAAAAPtvjrXLAzSd2ANyzIkiSqk_yFpt', {action: 'join'}).then((thetoken) => {

            this.readyt = true
        this.openingBgm.stop()
        var config =  {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
    

        this.coin = this.sound.add('coin', config)
        this.damage = this.sound.add('damage', config)
        this.hit = this.sound.add('hit', config)
        this.winSound = this.sound.add('winSound', config)
        this.loseSound = this.sound.add('loseSound', config)
    
        this.tps = 0
        //background
        this.background = this.add.tileSprite(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 'background').setOrigin(0).setDepth(2);
        this.background.fixedToCamera = true;

        //player 
        
        this.meSword = this.add.image(400, 100, "sword").setScale(0.25).setDepth(50)
        this.mePlayer = this.add.image(400, 100, "player").setScale(0.25).setDepth(51)
        this.swordAnim = {go: false, added: 0}
        this.goTo = {
            x: undefined,
            y: undefined
        }
        this.myObj = undefined

        //killcounter
        this.killCount = this.add.text(document.documentElement.clientWidth / 1.5, 0, 'Kills: 0', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
        }).setFontSize(40).setDepth(101);
        this.killCount.scrollFactorX = 0
        this.killCount.scrollFactorY = 0

        //player+fpscounter
        try { 
        this.playerCount = this.add.text(this.cameras.main.worldView.x*this.cameras.main.zoom, this.cameras.main.worldView.y*this.cameras.main.zoom, 'Players: 0' + "\nFPS: 0", {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
        }).setFontSize(20).setDepth(101);
        this.playerCount.scrollFactorX = 0
        this.playerCount.scrollFactorY = 0

        //leaderboard
        this.leaderboard = this.add.text(document.documentElement.clientWidth, this.cameras.main.worldView.y*this.cameras.main.zoom, 'Players: 0' + "\nFPS: 0", {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
        }).setFontSize(20).setDepth(101);
        this.playerCount.scrollFactorX = 0
        this.playerCount.scrollFactorY = 0
    } catch(e) {
        console.log(e)
    }
        //minimap
        const convert = (num, val, newNum) => (newNum * val) / num
        this.miniMap = {people: [], scaleFactor: convert(1189, 96, document.documentElement.clientWidth), square: undefined}
        this.miniGraphics = this.add.graphics().setDepth(100)
        
        var padding = 13
        this.miniMap.scaleFactor = convert(1189, 96, document.documentElement.clientWidth)
        this.miniGraphics.x = document.documentElement.clientWidth - ((this.miniMap.scaleFactor * 2) + padding)
        this.miniGraphics.y = document.documentElement.clientHeight - ((this.miniMap.scaleFactor * 2) + padding)
        this.miniGraphics.lineStyle(5, 0xffff00, 1)
        this.miniGraphics.strokeRoundedRect(0, 0, this.miniMap.scaleFactor * 2,  this.miniMap.scaleFactor * 2, 0)
        
        this.cameras.main.ignore(this.miniGraphics)

        //
        //joystick
        if(this.mobile) {
        this.joyStick = this.plugins
        .get("rexvirtualjoystickplugin")
        .add(this, {
          x: 150,
          y: document.documentElement.clientHeight - 150,
          radius: 100,
          base: this.add.circle(0, 0, 100, 0x888888),
          thumb: this.add.circle(0, 0, 50, 0xcccccc)
          // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
          // forceMin: 16,
          // enable: true
        })
    }
      
        //bar
        this.meBar = new _HealthBar_js__WEBPACK_IMPORTED_MODULE_0__["default"](this, 0, 0, 16, 80)

        //levelbar
        this.lvlBar = new _HealthBar_js__WEBPACK_IMPORTED_MODULE_0__["default"](this, 0, 0, 0, 100)
        this.lvlBar.draw()

        //coins array
        this.coins = []
       // this.lastMove = Date.now()

        //enemies array
        this.enemies = []
        this.dead = false
        //arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        //camera follow
        this.cameras.main.setZoom(1)
        
        
        this.UICam = this.cameras.add(this.cameras.main.x, this.cameras.main.y, document.documentElement.clientWidth, document.documentElement.clientHeight);
        this.cameras.main.ignore([ this.killCount, this.playerCount, this.leaderboard,this.lvlBar.bar ]);
        this.UICam.ignore([this.mePlayer, this.meBar.bar, this.meSword, this.background])
        this.cameras.main.startFollow(this.mePlayer);


        this.input.addPointer(3);
        ///resize dynamicly
        const resize = () => {
            try {

            this.game.scale.resize( document.documentElement.clientWidth,  document.documentElement.clientHeight)
            if(this.mobile) this.joyStick.y = document.documentElement.clientHeight - 150
            this.UICam.x = this.cameras.main.x
            this.UICam.y = this.cameras.main.y

            this.miniGraphics.clear()
            var padding = 13
            this.miniMap.scaleFactor = convert(1189, 96, document.documentElement.clientWidth)
            this.miniGraphics.x = document.documentElement.clientWidth - ((this.miniMap.scaleFactor * 2) + padding)
            this.miniGraphics.y = document.documentElement.clientHeight - ((this.miniMap.scaleFactor * 2) + padding)
            this.miniGraphics.lineStyle(5, 0xffff00, 1)
            this.miniGraphics.strokeRoundedRect(0, 0, this.miniMap.scaleFactor * 2,  this.miniMap.scaleFactor * 2, 0)


            this.background.width = document.documentElement.clientWidth
                this.background.height =  document.documentElement.clientHeight
            
                var padding = (document.documentElement.clientWidth / 2)
                this.lvlBar.x = padding / 2
                
                this.lvlBar.width = document.documentElement.clientWidth- padding
                this.lvlBar.height = document.documentElement.clientHeight / 30
                this.lvlBar.y = document.documentElement.clientHeight - this.lvlBar.height - (document.documentElement.clientHeight / 40)
                this.lvlBar.draw()
            
        } catch(e) {
            console.log(e)
        }
        }

         window.addEventListener("resize", resize, true);
        //go packet
        this.socket = io()
        this.socket.emit("go", this.name, thetoken)

        //mouse down

        this.input.on('pointerdown', function (pointer) {
            if(this.mobile && this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return
            if (!this.mouseDown) {
                this.gamePoint = {x: pointer.x, y: pointer.y}
                this.mouseDown = true
                this.socket.emit("mouseDown", true)

            }
        }, this);
        this.input.on('pointerup', function (pointer) {
            
            if(this.mobile && this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return
            if (this.mouseDown) {
                this.gamePoint = {x: pointer.x, y: pointer.y}
                this.mouseDown = false
                this.socket.emit("mouseDown", false)
            }
        }, this);
        if(this.mobile) {
            this.gamePoint = {x: 0, y: 0}
        this.input.on('pointermove', (pointer) => {
            if(this.joyStick.pointer && this.joyStick.pointer.id == pointer.id) return
            this.gamePoint = {x: pointer.x, y: pointer.y}
        })
    }
        this.socket.on("tps", (tps) => {
            this.tps = tps
        })
        this.socket.on("ban", (data) => {
            document.write(data)
        })

        //boundary
        this.graphics = this.add.graphics().setDepth(4)
        var thickness = 5000
        this.graphics.lineStyle(thickness, 0x006400, 1)

        this.graphics.strokeRoundedRect(-2500 - (thickness/ 2), -2500 - (thickness/ 2), 5000 + thickness, 5000 + thickness, 0 )

        this.graphics.lineStyle(10, 0xffff00, 1)

        this.graphics.strokeRoundedRect(-2500, -2500, 5000, 5000, 0);

        //server -> client
        const addPlayer = (player) => {
           if (this.enemies.filter(e => e.id === player.id).length > 0) return
  /* vendors contains the element we're looking for */

            var enemy = {
                id: player.id,
                down: false,
                toMove: {
                    x: undefined,
                    y: undefined
                },
                playerObj: undefined,
                lastTick: Date.now(),
                sword: this.add.image(player.pos.x, player.pos.y, player.skin+"Sword").setScale(0.25).setDepth(49),
                player: this.add.image(player.pos.x, player.pos.y, player.skin+"Player").setScale(0.25).setDepth(49),
                bar: new _HealthBar_js__WEBPACK_IMPORTED_MODULE_0__["default"](this, player.pos.x, player.pos.y + 55),
                nameTag: this.add.text(player.pos.x, player.pos.y - 90, player.name, {
                    fontFamily: 'serif',
                    fill: '#000000',
                    fontSize: '25px'
                }).setDepth(100),
                swordAnim: {go: false, added: 0},
                toAngle: 0
            }
         
                var factor = (100/(player.scale*100))*1.5
       
            enemy.sword.angle = Math.atan2(player.mousePos.y - ((player.mousePos.viewport.height) / 2), player.mousePos.x - ((player.mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;
            
            
            enemy.sword.x = enemy.player.x + enemy.player.width / factor * Math.cos(enemy.sword.angle * Math.PI / 180)
            enemy.sword.y = enemy.player.y + enemy.player.width / factor * Math.sin(enemy.sword.angle * Math.PI / 180)

          
            this.UICam.ignore([enemy.player, enemy.bar.bar, enemy.sword, enemy.nameTag, this.graphics])
            this.enemies.push(enemy)

            var circle = this.add.circle(0, 0, 10, 0xFF0000)
            this.cameras.main.ignore(circle)
            circle.setDepth(98)
             this.miniMap.people.push(
                 {
                     id: player.id,
                     circle: circle
                 }
             )

        }
        this.removePlayer = (id) => {
            try {
                var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == id)
        
                enemy.player.destroy()
                enemy.sword.destroy()
                enemy.bar.destroy()
                enemy.nameTag.destroy()
        
                this.enemies.splice(this.enemies.findIndex(enemy => enemy.id == id), 1)
        
                var miniMapPlayer = this.miniMap.people.find(x => x.id === id)
                miniMapPlayer.circle.destroy()
                this.miniMap.people = this.miniMap.people.filter(p => p.id != id)
        
            } catch (e) {
                console.log(e)
            }
        }


        this.socket.on("players", (players) => {
            players.forEach(player => addPlayer(player))

            this.ready = true
          
            if(!this.ready) {
                this.ready = true
          
            }
        })
        this.socket.on("new", (player) => {
            addPlayer(player)
            if(!this.ready) {
            this.ready = true
           
            }
        })
        this.socket.on("me", (player) => {
            if(this.loadrect.visible) this.loadrect.destroy()

            if(this.mePlayer.texture.key+"Player" != player.skin) {
                this.mePlayer.setTexture(player.skin+"Player")
                this.meSword.setTexture(player.skin+"Sword")
            }

            if (!this.myObj) {
                this.mePlayer.x = player.pos.x
                this.mePlayer.y = player.pos.y
            } else {
                this.goTo.x = player.pos.x
                this.goTo.y = player.pos.y
            }
            this.mePlayer.setScale(player.scale)
            this.meBar.maxValue = player.maxHealth
            this.meBar.setHealth(player.health)
           // if(this.myObj) console.log( this.cameras.main.zoom+" -> "+this.myObj.coins+" -> "+player.scale)
            if(!(this.cameras.main.zoom <= 0.15)) {
            if(player.scale < 0.75) this.cameras.main.setZoom(1.25-player.scale)
            if(player.scale >= 3) this.cameras.main.setZoom(0.56-((player.scale-1)/8))
            else if(player.scale >= 1) this.cameras.main.setZoom(0.56-((player.scale-1)/8))
            
            else if(player.scale >= 0.75) this.cameras.main.setZoom(0.56-((player.scale-0.75)/3))



            }
            this.meSword.setScale(player.scale)
          //  this.background.setTileScale(1)
            this.background.width = this.cameras.main.displayWidth
            this.background.height = this.cameras.main.displayHeight
            //this.meLine.setTo(0, 0, 250, 250)
            this.killCount.setText("Kills: " + player.kills+"\nCoins: "+player.coins)
            this.myObj = player

            //minimap
            if(!this.miniMap.people.find(x => x.id === player.id)) {
                var circle = this.add.circle(0, 0, 10, 0xFFFFFF)
                this.cameras.main.ignore(circle)
                circle.setDepth(99)
                 this.miniMap.people.push(
                     {
                         id: player.id,
                         circle: circle
                     }
                 )
            }

            var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id)
            
            miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / 2500) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor
            miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / 2500) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor
            miniMapPlayer.circle.radius = player.scale * convert(1280, 20, document.documentElement.clientWidth)
        })
        this.socket.on("player", (player) => {
            //update player
            if (!this.ready) return
            try {
               
                var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == player.id)
                if(!enemy) return

                enemy.lastTick = Date.now()

                enemy.playerObj = player
                enemy.bar.maxValue = player.maxHealth
                enemy.bar.setHealth(player.health);

                //update pos
                enemy.toMove.x = player.pos.x
                enemy.toMove.y = player.pos.y

                //update sword
                var mousePos = player.mousePos
                enemy.toAngle = Math.atan2(mousePos.y - ((mousePos.viewport.height) / 2), mousePos.x - ((mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;

                enemy.player.setScale(player.scale)
                enemy.sword.setScale(player.scale)
                enemy.down = player.mouseDown

                //minimap
                var miniMapPlayer = this.miniMap.people.find(x => x.id === player.id)
            
        

                miniMapPlayer.circle.x = (this.miniGraphics.x + ((player.pos.x / 2500) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor
                miniMapPlayer.circle.y = (this.miniGraphics.y+ ((player.pos.y / 2500) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor
                miniMapPlayer.circle.radius = convert(1280, 20, document.documentElement.clientWidth) * player.scale

            } catch (e) {
                console.log(e)
            }
        })
        this.socket.on("playerLeave", this.removePlayer)
        this.socket.on("playerDied", this.removePlayer)

        this.socket.on("dealHit", (playerId) => {
            this.hit.play()
        })
        this.socket.on("takeHit", (playerId) => {
            this.damage.play()
        })

        //coins

        const addCoin = coin => {
          if(this.dead) return
            this.coins.push(
                {
                    id: coin.id,
                    item: this.add.image(coin.pos.x, coin.pos.y, 'coin').setScale(coin.size/100).setDepth(20),
                    state: {collected: false, collectedBy: undefined, time: 0}
                }
                )

                this.UICam.ignore(this.coins[this.coins.length - 1].item)
        }

        this.socket.on("coins", (coinsArr) => {
           
            coinsArr.forEach((coin) => {
                if(this.coins.filter(e => e.id == coin.id).length == 0) {
                    addCoin(coin)
                }
            })

           var remove = this.coins.filter(e=>coinsArr.filter(b => (e.id == b.id) && (!e.state.collected)).length == 0)
           remove.forEach((coin) => {
               
               coin.item.destroy()
           })
           this.coins = this.coins.filter(e=>coinsArr.filter(b => (e.id == b.id) && (!e.state.collected)).length == 1)
        })

        this.socket.on("coin", (coin) => {      
            if(Array.isArray(coin)) {
                coin.forEach((x) => {
                    addCoin(x)
                })
            } else {      
            addCoin(coin)
            }
        })

        this.socket.on("youDied", (data) => {
            this.died(data)
        })
        this.socket.on("youWon", (data) => {
            this.win(data)
        })
        this.socket.on("collected", (coinId, playerId) => {
            if(this.myObj && this.myObj.id == playerId) this.coin.play() 
            if(this.coins.find(coin => coin.id == coinId)) this.coins.find(coin => coin.id == coinId).state = {collected: true, collectedBy: playerId, time: 0}
        })

    })
    })
    }

    update() {
        if(!this.readyt) return
       
        var controller = {
            left: false,
            up: false,
            right: false,
            down: false
        }


        var wKey = this.input.keyboard.addKey('W');
        var aKey = this.input.keyboard.addKey('A');
        var sKey = this.input.keyboard.addKey('S');
        var dKey = this.input.keyboard.addKey('D');
        try {
        this.key = this.mobile ?  this.joyStick.createCursorKeys() : this.cursors
        if (this.key.up.isDown || wKey.isDown ) {
            controller.up = true

        }
        if (this.key.down.isDown || sKey.isDown ) {
            controller.down = true

        }
        if (this.key.right.isDown || dKey.isDown) {
            controller.right = true

        }
        if (this.key.left.isDown || aKey.isDown) {
            controller.left = true

        }
    
        this.socket.emit("move", controller)
        } catch(e) {
            console.log(e)
        }
       // this.lastMove = Date.now()
        //sword 

               
if(this.meSword) var old = this.meSword.angle

if(!this.mobile) var mousePos = this.input
else var mousePos = this.gamePoint

this.meSword.angle = Math.atan2(mousePos.y - ( document.documentElement.clientHeight / 2), mousePos.x - (document.documentElement.clientWidth / 2)) * 180 / Math.PI + 45;
this.mePlayer.angle = this.meSword.angle + 45 +180
         //sword animation
        if (this.mouseDown) this.swordAnim.go = true
        else this.swordAnim.go = false
        
        
        if(this.swordAnim.go) {

            if(this.swordAnim.added < 50) this.swordAnim.added += 10
            this.meSword.angle -= this.swordAnim.added
        } else if(this.swordAnim.added >0) {
             this.swordAnim.added -= 10
            this.meSword.angle -= this.swordAnim.added
        }
        
        
        var mousePos2 = {
            viewport: {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            },
            x: mousePos.x,
            y: mousePos.y
        }

        if (this.socket && old && this.meSword.angle != old) this.socket.emit("mousePos", mousePos2)

        var fps = this.sys.game.loop.actualFps
   
        //var difference = function (a, b) { return Math.abs(a - b); }
            function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function repeat(t, m) {
  return clamp(t - Math.floor(t / m) * m, 0, m);
}

function lerpTheta(a, b, t) {
  const dt = repeat(b - a, 360);
  return lerp(a, a + (dt > 180 ? dt - 360 : dt), t);
}
        this.enemies.forEach(enemy => {
            if(Date.now() - enemy.lastTick > 10000) return this.removePlayer(enemy)
           // if (enemy.player.x != enemy.toMove.x && enemy.player.y !=enemy.toMove.y) speed = speed *0.707
    /*        no lerp
            if (enemy.player.x < enemy.toMove.x) enemy.player.x += speed
            if (enemy.player.x > enemy.toMove.x) enemy.player.x -= speed
            if (enemy.player.y < enemy.toMove.y) enemy.player.y += speed
            if (enemy.player.y > enemy.toMove.y) enemy.player.y -= speed
            */
            //yes lerp

if(enemy.toMove.x ) {
        enemy.player.x = lerp(enemy.player.x, enemy.toMove.x,fps/500)
enemy.player.y = lerp(enemy.player.y, enemy.toMove.y, fps/500)
}


          // if(difference(enemy.player.x, enemy.toMove.x) < speed) enemy.player.x = enemy.toMove.x
          // if(difference(enemy.player.y, enemy.toMove.y) < speed) enemy.player.y = enemy.toMove.y
        if(enemy.playerObj) var scale = enemy.playerObj.scale
        else var scale = 0.25
          enemy.bar.width = (enemy.player.height*scale / 0.9375)
          enemy.bar.height = (enemy.player.height*scale*0.150)
          enemy.bar.x = enemy.player.x  - enemy.bar.width / 2
          enemy.bar.y = enemy.player.y - (enemy.player.height*scale/1.2)

            enemy.bar.draw()
            try {
            enemy.nameTag.setFontSize(100*scale)
            enemy.nameTag.x = enemy.player.x  - enemy.nameTag.width / 2
            enemy.nameTag.y = enemy.player.y - (enemy.player.height*scale) - enemy.nameTag.height
            } catch(e) {
                console.log(e)
            }
          if(enemy.playerObj) {
            var factor = (100/(enemy.playerObj.scale*100))*1.5
          } else {
              var factor = 6
          }         enemy.sword.angle = lerpTheta(enemy.sword.angle, enemy.toAngle, 0.5)
          enemy.player.angle = enemy.sword.angle + 45 + 180

                         if (enemy.down) {
                             enemy.swordAnim.go = true
                            if(!enemy.swordAnim.added) enemy.swordAnim.added = 0
                        } else enemy.swordAnim.go = false

                if(enemy.swordAnim.go && enemy.swordAnim.added < 50) {
                    enemy.swordAnim.added += 10
                }

                if(!enemy.swordAnim.go  && enemy.swordAnim.added > 0) {
                    enemy.swordAnim.added -= 10

                }
                enemy.sword.angle -= enemy.swordAnim.added
               

            enemy.sword.x = enemy.player.x + enemy.player.width / factor * Math.cos(enemy.sword.angle * Math.PI / 180)
            enemy.sword.y = enemy.player.y + enemy.player.width / factor * Math.sin(enemy.sword.angle * Math.PI / 180)


                
        })
 
    /*    if(this.myObj) {
            var speed = this.myObj.speed / fps
        } else {
            var speed = 700 /fps
        }
        
   
         //console.log(speed)
     
        if (this.goTo.x != this.mePlayer.x && this.goTo.y != this.mePlayer.y) speed = speed *0.707
 //without lerp
        if (this.goTo.x < this.mePlayer.x) this.mePlayer.x -= speed
        if (this.goTo.x > this.mePlayer.x) this.mePlayer.x += speed
        if (this.goTo.y < this.mePlayer.y) this.mePlayer.y -= speed
        if (this.goTo.y > this.mePlayer.y) this.mePlayer.y += speed
        */
        //with lerp

if(this.goTo.x ) {
    
        this.mePlayer.x = lerp(this.mePlayer.x, this.goTo.x, fps/500)
this.mePlayer.y = lerp(this.mePlayer.y, this.goTo.y,fps/500)
}
//console.log(this.mePlayer.x, this.mePlayer.y)
      //  if(difference(this.goTo.x, this.mePlayer.x) < 10) this.mePlayer.x = this.goTo.x
      //  if(difference(this.goTo.y, this.mePlayer.y) < 10) this.mePlayer.y = this.goTo.y
      var myObj = this.myObj
  
        if(!myObj) myObj = {scale: 0.25}

        this.meBar.width = (this.mePlayer.height*myObj.scale / 0.9375)
        this.meBar.height = (this.mePlayer.height*myObj.scale*0.200)
        this.meBar.x = this.mePlayer.x  - this.meBar.width / 2
        this.meBar.y = this.mePlayer.y - (this.mePlayer.height*myObj.scale/1.2)
        this.meBar.draw()
        if(this.myObj) { 
        var factor1 = (100/(this.myObj.scale*100))*1.5
        } else {
            var factor1 = 6
        }
        this.meSword.x = this.mePlayer.x + this.mePlayer.width / factor1 * Math.cos(this.meSword.angle * Math.PI / 180)
        this.meSword.y = this.mePlayer.y + this.mePlayer.width / factor1 * Math.sin(this.meSword.angle * Math.PI / 180)


        

        //leaderboard
        if(!this.myObj) return
        
        var enemies = this.enemies.filter(a=>a.hasOwnProperty("playerObj") && a.playerObj)

        enemies.push({playerObj: this.myObj})
       try {
        var sorted = enemies.sort((a,b) => a.playerObj.coins - b.playerObj.coins).reverse().slice(0,10)
        var text = ""
        sorted.forEach((entry, i) => {
            if(!entry.playerObj) return
            if(!entry.playerObj.hasOwnProperty("coins")) return console.log(entry.playerObj)
            var playerObj = entry.playerObj
            text += `#${i+1}: ${playerObj.name}- ${playerObj.coins}\n`
        })

        this.leaderboard.setText(text)
        this.leaderboard.x = document.documentElement.clientWidth - this.leaderboard.width
        this.killCount.x = (document.documentElement.clientWidth*0.9) - this.leaderboard.width - this.killCount.width

    } catch(e) {
        //we shall try next frame
        console.log(e)
    }
        //playercount
        try {
        this.playerCount.setText('Players: ' + (Object.keys(this.enemies).length + 1).toString() + "\nFPS: " + Math.round(this.sys.game.loop.actualFps) + "\nTick Speed: " + Math.round((this.tps / 30) * 100) + "%")
        this.playerCount.x = 0
        this.playerCount.y = 0
        } catch(e) {
            console.log(e)
        }
        if(!this.myObj) return
        const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1); 
        this.coins.forEach((coin) => {
            if(coin.state.collected) {
                if(coin.state.collectedBy == this.myObj.id) {
                    var x = this.mePlayer.x
                    var y = this.mePlayer.y
                } else {
                  try {
                    var player = this.enemies.find(el => el.id == coin.state.collectedBy)
                    var x = player.player.x
                    var y = player.player.y
                  } catch(e) {
                    console.log(e)
                    return
                  }
                }
                    coin.item.x = lerp(coin.item.x, x, ((6 - (Math.log2(fps) - Math.log2(1.875))) / 10)*2)
                    coin.item.y = lerp(coin.item.y, y,(6 - (Math.log2(fps) - Math.log2(1.875))) / 10)
                    coin.state.time += 1
                    if(distance(coin.item.x, coin.item.y, x, y) < this.mePlayer.width * this.mePlayer.scale / 3 || coin.state.time > 7) {
                        coin.item.destroy()
                        this.coins = this.coins.filter((el) => el.id != coin.id)
                    }
                
            }
        })

        //background movement
        this.background.setTilePosition(this.cameras.main.scrollX, this.cameras.main.scrollY);
        this.background.x = this.mePlayer.x - (this.cameras.main.displayWidth / 2)
        this.background.y = this.mePlayer.y- (this.cameras.main.displayHeight/ 2)
        if (this.ready && !this.dead && !this.socket.connected) {
            document.write("<h1>You got disconnected</h1><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>")
            this.dead = true
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameScene);


/***/ }),

/***/ "./src/HealthBar.js":
/*!**************************!*\
  !*** ./src/HealthBar.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class HealthBar {

    constructor (game, x, y, width, height)
    {

        this.bar = new Phaser.GameObjects.Graphics(game).setDepth(99);
  
        this.x = x;
        this.y = y;

        this.maxValue = 100;
        this.value = 100;
        
        this.height = height
        this.width = width
  
        game.add.existing(this.bar);
    }
  
    setHealth (amount)
    {
  
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        this.value = clamp(amount, 0, this.maxValue)
  
        this.draw();
  
        return (this.value === 0);
    }
  
    draw ()
    {
        this.bar.clear();
  
        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, this.width, this.height);
  
        //  Health
  
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 2, this.y + 2, this.width-4, this.height-4);
  
        if (this.value < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor((this.width-4) * (this.value/this.maxValue));
  
        this.bar.fillRect(this.x + 2, this.y + 2, d, this.height-4);
    }
  
    destroy ()
    {
      this.bar.destroy()
    }
  
  }
  

  /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HealthBar);

/***/ }),

/***/ "./src/OpenScene.js":
/*!**************************!*\
  !*** ./src/OpenScene.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
        this.background = this.add.rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight, 0x000000).setOrigin(0).setScrollFactor(0, 0).setScale(2);
        this.text = this.add.text(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2, 'Click to join the game..', {
            fontSize: '64px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        this.text.setAlpha(0)
        ///resize dynamicly
        const resize = () => {
            try {
            this.game.scale.resize(document.documentElement.clientWidth, document.documentElement.clientHeight)
            this.background.height = document.documentElement.clientHeight
            this.background.width = document.documentElement.clientWidth
            
            
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
        this.text.x = (document.documentElement.clientWidth / 2)
        this.text.y = (document.documentElement.clientHeight / 2)
        this.text.setFontSize(document.documentElement.clientWidth * 128 / 1920)
        if(!this.go) {
        if(this.text.alpha < 1) this.text.setAlpha(this.text.alpha + 0.01)
        } else {
            if(this.text.alpha > 0 )this.text.setAlpha(this.text.alpha - 0.05)
            else this.scene.start('title')
        }
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (OpenScene);

/***/ }),

/***/ "./src/TitleScene.js":
/*!***************************!*\
  !*** ./src/TitleScene.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class TitleScene extends Phaser.Scene {
  constructor(callback) {
    super()
    this.callback = callback
  }
 preload() {

  document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 100;
  this.load.image('opening', '/assets/images/opening.png');
  this.load.html("title", "/title.html");
  this.load.html("promo", "/promo.html");
  this.load.audio('openingsound', '/assets/sound/opening.mp3')

 // document.cookie = "validate=madebycodergautamdonthackorelseurstupid";
}

 create() {
   this.redirect = false
  var access = true
  try {
    window.localStorage
  } catch(e) {
    access = false
  }
try {
  this.music = this.sound.add('openingsound', {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0
});
this.music.play()
} catch(e) {

return

}

this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)


  this.background = this.add.image(0, 0, 'opening').setOrigin(0).setScrollFactor(0, 0).setScale(2);
  this.background.displayHeight = document.documentElement.clientHeight
  this.background.displayWidth =document.documentElement.clientWidth
  if(this.showPromo) {
            this.mobile = false;
        ((a)=>{if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) this.mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
        if(this.mobile) this.showPromo = false
  }
  this.nameBox = this.add.dom(document.documentElement.clientWidth/2, document.documentElement.clientHeight/1.7 ).createFromCache("title");
     if(this.showPromo) {

       this.promo = this.add.dom(0, 0).createFromCache("promo")

       this.promo.x = (document.documentElement.clientWidth / 2)
       this.promo.y =  (document.documentElement.clientHeight / 2)
     
       this.promo.getChildByName("close").onclick = () => {
         this.promo.destroy()
       }
 
     }

  this.input.keyboard.on('keydown', function (event) {

    if(this.nameBox.getChildByName('name') && (this.nameBox.getChildByName('name').value.length >= 16 ||this.nameBox.getChildByName('name')  !== document.activeElement)) return
   	if(event.key == 'a'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	}else if(event.key == 's'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	}else if(event.key == 'd'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	}else if(event.key == 'w'){
   		this.nameBox.getChildByName('name').value+=event.key;
   	} else if(event.which == 32) {
       this.nameBox.getChildByName('name').value+=event.key;
     }
}.bind(this));
  if(access) this.nameBox.getChildByName("name").value = window.localStorage.getItem("oldName")  ?  window.localStorage.getItem("oldName") : ""
  else this.nameBox.getChildByName("name").value = ""

  
  this.done = false
  this.text = this.add.text(document.documentElement.clientWidth/2, 0, 'Swordbattle.io', {
    fontSize: '64px',
    fill: '#000000'
  }).setOrigin(0.5);
  const go = () => {
    let name = this.nameBox.getChildByName("name")

  // let name ={value: "hi"}
    if(!name) return
    else if(name.value == "") return
    else if(this.done) return
    else {
      this.done = true
      if(access) window.localStorage.setItem("oldName", name.value)
      this.callback(name.value, this.music)
      this.nameBox.destroy()

    }
  }

  this.nameBox.getChildByName("btn").onclick = () => {
    if(this.promo && this.promo.visible) {
    } else go()
  }
  this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  this.returnKey.on("down", event => {
   if(this.promo && this.promo.visible) {
     this.promo.destroy()
   } else go()
  });

  
  const resize = ()=>{
    
    this.game.scale.resize(document.documentElement.clientWidth, document.documentElement.clientHeight)
    this.background.displayHeight = document.documentElement.clientHeight
    this.background.displayWidth =document.documentElement.clientWidth
    this.nameBox.x = document.documentElement.clientWidth / 2
    this.nameBox.y = document.documentElement.clientHeight / 2
    this.text.x = document.documentElement.clientWidth / 2
    if(this.text.y != 0) this.text.y = document.documentElement.clientHeight / 3
  }
        
    window.addEventListener("resize", resize, false);

resize()
    
}

 update(d) {
  function lerp (start, end, amt){
    return (1-amt)*start+amt*end
  }
   try {
  this.text.setFontSize( document.documentElement.clientWidth / 10)
  if(this.text.y < document.documentElement.clientHeight/3) this.text.y = lerp(this.text.y, document.documentElement.clientHeight/3, 0.1)
   } catch(e) {


if(this.redirect) return
this.redirect = true
alert("Your administrator has blocked swordbattle.io\nDon't worry, You are being redirected to a proxy server to attempt to bypass this.")
  window.location.replace('https://sword-io-game.herokuapp.com/')

  }
}
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TitleScene);

/***/ }),

/***/ "./src/WonScene.js":
/*!*************************!*\
  !*** ./src/WonScene.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WonScene);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _TitleScene_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TitleScene.js */ "./src/TitleScene.js");
/* harmony import */ var _GameScene_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GameScene.js */ "./src/GameScene.js");
/* harmony import */ var _DeathScene_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DeathScene.js */ "./src/DeathScene.js");
/* harmony import */ var _WonScene_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./WonScene.js */ "./src/WonScene.js");
/* harmony import */ var _OpenScene_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./OpenScene.js */ "./src/OpenScene.js");






var config = {
    type: Phaser.AUTO,
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    parent: "game",
    dom: {
        createContainer: true
    },
    scale: {
        mode:Phaser.Scale.RESIZE,
    }
};

var game = new Phaser.Game(config);

var deathScene = new _DeathScene_js__WEBPACK_IMPORTED_MODULE_2__["default"]()
var winScene = new _WonScene_js__WEBPACK_IMPORTED_MODULE_3__["default"]()

var gameScene = new _GameScene_js__WEBPACK_IMPORTED_MODULE_1__["default"]((data) => {
    if(data.win) {
        winScene.data = data.data
        gameScene.scene.start('win')
    } else {
    deathScene.data = data.data
    gameScene.scene.start('death')
    }
})

var titleScene = new _TitleScene_js__WEBPACK_IMPORTED_MODULE_0__["default"]((name, music) => {
    gameScene.name = name
    gameScene.openingBgm = music
    titleScene.scene.start('game')
    titleScene.showPromo = false
})
titleScene.showPromo = true
var openScene = new _OpenScene_js__WEBPACK_IMPORTED_MODULE_4__["default"]()
game.scene.add('title', titleScene)
game.scene.add('game', gameScene)
game.scene.add('death', deathScene)
game.scene.add('win', winScene)
game.scene.add('open', openScene)

game.scene.start('open')

//for debugging on the school chromebooks they fricking banned dev console
window.onerror = function(msg, url, line) {
    document.write("Error : " + msg + "<br><br>");
    document.write("Line number : " + line + "<br><br>");
    document.write("File : " + url);
}
})();

/******/ })()
;
//# sourceMappingURL=main.js.map