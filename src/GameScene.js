import HealthBar from './HealthBar.js'

class GameScene extends Phaser.Scene {
    constructor(callback) {
        super()
        this.callback = callback
    }

    preload() {
        console.log("Game Scene Preload")    
         try {       
        document.getElementsByClassName("grecaptcha-badge")[0].style.opacity = 0;
         } catch(e) {
             console.log(e)
         }
        this.ready = false;
        this.loadrect = this.add.rectangle(0,0, window.visualViewport.width*2, window.visualViewport.height*2, 0x006400).setDepth(200)
        console.log("Loading")
    }

    died(data) {
        console.log("died")
        this.loseSound.play()
        this.children.list.forEach((b) => {
            b.destroy();
        })
        this.dead = true
        data = Object.assign(data, {name: this.myObj.name, kills: this.myObj.kills, coins: this.myObj.coins})
        this.callback({win:false, data: data})
    }
    win(data) {
        console.log("win")
        this.winSound.play()
this.dead = true  
data = Object.assign(data, {name: this.myObj.name, kills: this.myObj.kills, coins: this.myObj.coins})
this.callback({win: true, data:data})
    }

    create() {
        this.mobile = false;
        ((a)=>{if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) this.mobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
        
        //recaptcha
        console.log("Game Scene Loaded")
        grecaptcha.ready(() =>{
            console.log("Getting  Captcha Token")
            grecaptcha.execute('6LdVxgYdAAAAAPtvjrXLAzSd2ANyzIkiSqk_yFpt', {action: 'join'}).then((thetoken) => {
                console.log("Captcha token gotten\nRendering screen...")
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
        
        console.log("Sounds loaded")

        this.canvas = {
            width: window.visualViewport.width,
            height: window.visualViewport.height
        }

        this.tps = 0
        //background
        this.background = this.add.tileSprite(-2500, -2500, 5000, 5000, 'background').setOrigin(0).setDepth(2);
        this.void = this.add.rectangle(-5000, -5000, 10000, 10000, 0x006400).setOrigin(0).setDepth(1);
        this.background.fixedToCamera = true;
        console.log("Background loaded")
        //player 
        
        this.meSword = this.add.image(400, 100, "sword").setScale(0.25).setDepth(50)
        this.mePlayer = this.add.image(400, 100, "player").setScale(0.25).setDepth(51)
        this.swordAnim = {go: false, added: 0}
        this.goTo = {
            x: undefined,
            y: undefined
        }
        this.myObj = undefined
        console.log("Player loaded")
        //killcounter
        this.killCount = this.add.text(window.visualViewport.width / 1.5, 0, 'Kills: 0', {
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
        this.leaderboard = this.add.text(window.visualViewport.width, this.cameras.main.worldView.y*this.cameras.main.zoom, 'Players: 0' + "\nFPS: 0", {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
        }).setFontSize(20).setDepth(101);
        this.playerCount.scrollFactorX = 0
        this.playerCount.scrollFactorY = 0
    } catch(e) {
        console.log(e)
    }
        //minimap
        const convert = (num, val, newNum) => (newNum * val) / num
        this.miniMap = {people: [], scaleFactor: convert(1189, 96, window.visualViewport.width), square: undefined}
        this.miniGraphics = this.add.graphics().setDepth(100)
        var padding = 13
        this.miniGraphics.x = window.visualViewport.width - ((this.miniMap.scaleFactor * 2) + padding)
        this.miniGraphics.y = window.visualViewport.height - ((this.miniMap.scaleFactor * 2) + padding)
        this.miniGraphics.lineStyle(5, 0xffff00, 1)
        this.miniMap.square =  this.miniGraphics.strokeRoundedRect(0, 0, this.miniMap.scaleFactor * 2,  this.miniMap.scaleFactor * 2, 0)
        this.cameras.main.ignore(this.miniGraphics)
        
        

        //
        //joystick
        if(this.mobile) {
            console.log("Mobile joystick loaded")
        this.joyStick = this.plugins
        .get("rexvirtualjoystickplugin")
        .add(this, {
          x: 150,
          y: window.visualViewport.height - 150,
          radius: 100,
          base: this.add.circle(0, 0, 100, 0x888888),
          thumb: this.add.circle(0, 0, 50, 0xcccccc)
          // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
          // forceMin: 16,
          // enable: true
        })
    }
      
        //bar
        this.meBar = new HealthBar(this, 0, 0, 16, 80)
        this.lvlBar = new HealthBar(this, 0, this.canvas.width - (this.canvas.width/ 20), this.canvas.width - (this.canvas.width / 40), 100)
        this.lvlBar.draw()
        
        console.log("UI Loaded")
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

        
        this.UICam = this.cameras.add(this.cameras.main.x, this.cameras.main.y, window.visualViewport.width, window.visualViewport.height);
        this.cameras.main.ignore([ this.killCount, this.playerCount, this.leaderboard, this.lvlBar.bar ]);
        this.UICam.ignore([this.mePlayer, this.meBar.bar, this.meSword, this.background, this.void])
        this.cameras.main.startFollow(this.mePlayer);

        console.log("Camera loaded")

        if(this.mobile) this.input.addPointer(3);
        ///resize dynamicly
        const resize = () => {
            try {

                const convert = (num, val, newNum) => (newNum * val) / num
            this.canvas = {
                width: window.visualViewport.width,
                height: window.visualViewport.height
            }
            this.game.scale.resize(this.canvas.width, this.canvas.height)
            if(this.mobile) this.joyStick.y = window.visualViewport.height - 150
            this.UICam.x = this.cameras.main.x
            this.UICam.y = this.cameras.main.y

            var padding = 13
            this.miniMap.scaleFactor = convert(1189, 96, window.visualViewport.width)
            this.miniGraphics.x = window.visualViewport.width - ((this.miniMap.scaleFactor * 2) + padding)
            this.miniGraphics.y = window.visualViewport.height - ((this.miniMap.scaleFactor * 2) + padding)
            this.miniMap.square.width = 3

            var padding = (this.canvas.width / 2)
            this.lvlBar.x = padding / 2
            console.log(this.miniMap.square)
            this.lvlBar.width = this.canvas.width - padding
            this.lvlBar.height = this.canvas.height / 30
            this.lvlBar.y = this.canvas.height - this.lvlBar.height - (this.canvas.height / 40)
            this.lvlBar.draw()
        } catch(e) {
            console.log(e)
        }
        }

         window.addEventListener("resize", resize, true);
         console.log("Responsive Canvas Loaded")
        //go packet
        console.log("Connecting to server...")
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

        console.log("Mouse handler loaded")
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
            console.log("Received ban event")
        })

        //boundary
        this.graphics = this.add.graphics().setDepth(4)

        this.graphics.lineStyle(10, 0xffff00, 1)

        this.graphics.strokeRoundedRect(-2500, -2500, 5000, 5000, 0);
        console.log("Boundary Drawn")
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
                bar: new HealthBar(this, player.pos.x, player.pos.y + 55),
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

          
            this.UICam.ignore([enemy.player, enemy.bar.bar, enemy.sword, enemy.nameTag])
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
            if(this.loadrect.visible) {
                this.loadrect.destroy()
                console.log("Connected to server!")
            }

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
            
            miniMapPlayer.circle.x = (this.miniMap.square.x + ((player.pos.x / 2500) * this.miniMap.scaleFactor))+this.miniMap.scaleFactor
            miniMapPlayer.circle.y = (this.miniMap.square.y+ ((player.pos.y / 2500) * this.miniMap.scaleFactor)) + this.miniMap.scaleFactor
            miniMapPlayer.circle.radius = ( 300 / (this.miniMap.scaleFactor / 2))*player.scale 
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
            
                miniMapPlayer.circle.x = (this.miniMap.square.x + ((player.pos.x / 2500) * 96))+96
                miniMapPlayer.circle.y = (this.miniMap.square.y+ ((player.pos.y / 2500) * 96)) + 96
                miniMapPlayer.circle.radius = (300 / 48 * player.scale)

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

        console.log("Player events loaded")

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

        console.log("Coin events loaded")
        console.log("Game load complete!")

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


this.meSword.angle = Math.atan2(mousePos.y - (this.canvas.height / 2), mousePos.x - (this.canvas.width / 2)) * 180 / Math.PI + 45;
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
                width: this.canvas.width,
                height: this.canvas.height
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
        this.leaderboard.x = window.visualViewport.width - this.leaderboard.width
        this.killCount.x = (window.visualViewport.width*0.9) - this.leaderboard.width - this.killCount.width

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
      //  this.background.setTilePosition(this.cameras.main.scrollX, this.cameras.main.scrollY);

        if (this.ready && !this.dead && !this.socket.connected) {
            document.write("<h1>You got disconnected</h1><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>")
            this.dead = true
        }
    }
}

export default GameScene;
