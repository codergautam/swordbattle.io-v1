import HealthBar from './HealthBar.js'
class GameScene extends Phaser.Scene {
    constructor(callback) {
        super()
        this.callback = callback
    }

    preload() {
        this.load.image("player", "/assets/images/player.png")
        this.load.image("sword", "/assets/images/sword.png")
        this.load.image('background', '/assets/images/background.jpeg');

        this.socket = io()
        this.ready = false;
    }

    died(data) {
        this.dead = true
        data = Object.assign(data, {name: this.myObj.name, kills: this.myObj.kills})
        this.callback(data)
    }

    create() {
        this.canvas = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        this.tps = 0
        //background
        this.background = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'background').setOrigin(0).setScrollFactor(0, 0);
        this.background.fixedToCamera = true;

        //player 
        this.mePlayer = this.add.image(400, 100, "player").setScale(0.25)
        this.goTo = {
            x: undefined,
            y: undefined
        }
        this.myObj = undefined

        //killcounter
        this.killCount = this.add.text(window.innerWidth / 1.5, 0, 'Kills: 0', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
        }).setFontSize(40);
        this.killCount.scrollFactorX = 0
        this.killCount.scrollFactorY = 0

        //player+fpscounter
        this.playerCount = this.add.text(0, 0, 'Players: 0' + "\nFPS: 0", {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif'
        }).setFontSize(20);
        this.playerCount.scrollFactorX = 0
        this.playerCount.scrollFactorY = 0

        //sword
        this.meSword = this.add.image(400, 100, "sword").setScale(0.25)

        //bar
        this.meBar = new HealthBar(this, 0, 0)

        //enemies array
        this.enemies = []
        this.dead = false
        //arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();

        //camera follow

        this.cameras.main.startFollow(this.mePlayer);

        ///
        const resize = () => {
            this.canvas = {
                width: window.innerWidth,
                height: window.innerHeight
            }
            this.game.scale.resize(this.canvas.width, this.canvas.height)
            this.background.width = this.canvas.width
            this.background.height = this.canvas.height
            this.killCount.x = window.innerWidth / 1.5
        }

        window.addEventListener("resize", resize, true);
        //go packet
        this.socket.emit("go", this.name)

        //mouse down
        this.input.on('pointerdown', function (pointer) {
            if (!this.mouseDown) {
                this.mouseDown = true
                this.socket.emit("mouseDown", true)
            }
        }, this);
        this.input.on('pointerup', function (pointer) {
            if (this.mouseDown) {
                this.mouseDown = false
                this.socket.emit("mouseDown", false)
            }
        }, this);
        this.socket.on("tps", (tps) => {
            this.tps = tps
        })

        //boundary
        this.graphics = this.add.graphics()

        this.graphics.lineStyle(1, 0xffff00, 1)

        this.graphics.strokeRoundedRect(-2504, -2504, 5000, 5000, 0);
        //server -> client
        const addPlayer = (player) => {
           
            var enemy = {
                id: player.id,
                down: false,
                toMove: {
                    x: undefined,
                    y: undefined
                },
                playerObj: undefined,
                sword: this.add.image(player.pos.x, player.pos.y, "sword").setScale(0.25),
                player: this.add.image(player.pos.x, player.pos.y, "player").setScale(0.25),
                bar: new HealthBar(this, player.pos.x, player.pos.y + 50),
                nameTag: this.add.text(player.pos.x, player.pos.y - 90, player.name, {
                    fontFamily: 'serif',
                    fill: '#000000',
                    fontSize: '25px'
                })
            }

            enemy.sword.angle = Math.atan2(player.mousePos.y - ((player.mousePos.viewport.height) / 2), player.mousePos.x - ((player.mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;
            enemy.sword.x = enemy.player.x + enemy.player.width / 6 * Math.cos(enemy.sword.angle * Math.PI / 180)
            enemy.sword.y = enemy.player.y + enemy.player.width / 6 * Math.sin(enemy.sword.angle * Math.PI / 180)

            this.enemies.push(enemy)
        }

        const removePlayer = (id) => {
            try {
                var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == id)

                enemy.player.destroy()
                enemy.sword.destroy()
                enemy.bar.destroy()
                enemy.nameTag.destroy()

                this.enemies.splice(this.enemies.findIndex(enemy => enemy.id == id), 1)

            } catch (e) {
                console.log(e)
            }
        }

        this.socket.on("players", (players) => {
            players.forEach(player => addPlayer(player))

            this.ready = true
        })
        this.socket.on("new", (player) => {
            addPlayer(player)
            this.ready = true
        })
        this.socket.on("me", (player) => {
            if (!this.myObj) {
                this.mePlayer.x = player.pos.x
                this.mePlayer.y = player.pos.y
            } else {
                this.goTo.x = player.pos.x
                this.goTo.y = player.pos.y
            }
            this.meBar.setHealth(player.health)
            this.killCount.setText("Kills: " + player.kills)
            this.myObj = player


        })
        this.socket.on("player", (player) => {
            //update player
            if (!this.ready) return
            try {
                var enemy = this.enemies.find(enemyPlayer => enemyPlayer.id == player.id)
                enemy.playerObj = player
                enemy.bar.setHealth(player.health);

                //update pos
                enemy.toMove.x = player.pos.x
                enemy.toMove.y = player.pos.y

                //update sword
                var mousePos = player.mousePos
                enemy.sword.angle = Math.atan2(mousePos.y - ((mousePos.viewport.height) / 2), mousePos.x - ((mousePos.viewport.width) / 2)) * 180 / Math.PI + 45;
                if (enemy.down) {
                    enemy.sword.angle -= 30
                }

                enemy.down = player.mouseDown
            } catch (e) {
                console.log(e)
            }
        })


        this.socket.on("playerLeave", removePlayer)
        this.socket.on("playerDied", removePlayer)

        this.socket.on("youDied", (data) => {
            this.died(data)
        })
    }

    update() {
       
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

        if (this.cursors.up.isDown || wKey.isDown) {
            controller.up = true

        }
        if (this.cursors.down.isDown || sKey.isDown) {
            controller.down = true

        }
        if (this.cursors.right.isDown || dKey.isDown) {
            controller.right = true

        }
        if (this.cursors.left.isDown || aKey.isDown) {
            controller.left = true

        }

        this.socket.emit("move", controller)

        //sword rotation
        var old = this.meSword.angle
        if (this.mouseDown) old += 30

        var mousePos = this.input

        this.meSword.angle = Math.atan2(mousePos.y - (this.canvas.height / 2), mousePos.x - (this.canvas.width / 2)) * 180 / Math.PI + 45;
        
        if (this.mouseDown) this.meSword.angle -= 30
        
        this.meSword.x = this.mePlayer.x + this.mePlayer.width / 6 * Math.cos(this.meSword.angle * Math.PI / 180)
        this.meSword.y = this.mePlayer.y + this.mePlayer.width / 6 * Math.sin(this.meSword.angle * Math.PI / 180)
        
        
        var mousePos2 = {
            viewport: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            x: mousePos.x,
            y: mousePos.y
        }
        if (this.meSword.angle != old) this.socket.emit("mousePos", mousePos2)


        function movePointAtAngle(point, angle, distance) {
            return [
                point[0] + (Math.sin(angle) * distance),
                point[1] - (Math.cos(angle) * distance)
            ];
        }
        var x1 = this.meSword.x
        var y1 = this.meSword.y

        var position = movePointAtAngle([x1, y1], this.meSword.angle * Math.PI / 180, 50)

        //yes i know this is hackable im too lazy pls dont create a hack if you do then you have no life
        this.socket.emit("hitbox", {
                x: position[0],
                y: position[1]
        })
        var fps = this.sys.game.loop.actualFps
   
        console.log(this.enemies)
        var difference = function (a, b) { return Math.abs(a - b); }
        this.enemies.forEach(enemy => {
          if(enemy.playerObj) {
            var speed = enemy.playerObj.speed / fps
          } else {
            var speed = 300 / fps
          }
           // if (enemy.player.x != enemy.toMove.x && enemy.player.y !=enemy.toMove.y) speed = speed *0.707
            
            if (enemy.player.x < enemy.toMove.x) enemy.player.x += speed
            if (enemy.player.x > enemy.toMove.x) enemy.player.x -= speed
            if (enemy.player.y < enemy.toMove.y) enemy.player.y += speed
            if (enemy.player.y > enemy.toMove.y) enemy.player.y -= speed

           if(difference(enemy.player.x, enemy.toMove.x) < speed) enemy.player.x = enemy.toMove.x
           if(difference(enemy.player.y, enemy.toMove.y) < speed) enemy.player.y = enemy.toMove.y

            enemy.bar.x = enemy.player.x - (enemy.player.width / 7)
            enemy.bar.y = enemy.player.y - (enemy.player.height / 5)
            enemy.bar.draw()

            enemy.nameTag.x = enemy.player.x - (enemy.nameTag.width / 2)
            enemy.nameTag.y = enemy.player.y - 90

            enemy.sword.x = enemy.player.x + enemy.player.width / 6 * Math.cos(enemy.sword.angle * Math.PI / 180)
            enemy.sword.y = enemy.player.y + enemy.player.width / 6 * Math.sin(enemy.sword.angle * Math.PI / 180)

        })
        if(this.myObj) {
        var speed = this.myObj.speed / fps
        } else {
            var speed = 300 / fps
        }
      //  if (this.goTo.x != this.mePlayer.x && this.goTo.y != this.mePlayer.y) speed = speed *0.707

        if (this.goTo.x < this.mePlayer.x) this.mePlayer.x -= speed
        if (this.goTo.x > this.mePlayer.x) this.mePlayer.x += speed
        if (this.goTo.y < this.mePlayer.y) this.mePlayer.y -= speed
        if (this.goTo.y > this.mePlayer.y) this.mePlayer.y += speed

        if(difference(this.goTo.x, this.mePlayer.x) < 10) this.mePlayer.x = this.goTo.x
        if(difference(this.goTo.y, this.mePlayer.y) < 10) this.mePlayer.y = this.goTo.y
        
        this.meBar.x = this.mePlayer.x - (this.mePlayer.width / 7)
        this.meBar.y = this.mePlayer.y - (this.mePlayer.height / 5)
        this.meBar.draw()

        this.meSword.x = this.mePlayer.x + this.mePlayer.width / 6 * Math.cos(this.meSword.angle * Math.PI / 180)
        this.meSword.y = this.mePlayer.y + this.mePlayer.width / 6 * Math.sin(this.meSword.angle * Math.PI / 180)
        //better health/killing/respawning coming soon :D
        if (this.ready && !this.dead && !this.socket.connected) {
            document.write("<h1>You disconnected</h1><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>")
            this.dead = true
        }

        //playercount
        this.playerCount.setText('Players: ' + (Object.keys(this.enemies).length + 1).toString() + "\nFPS: " + Math.round(this.sys.game.loop.actualFps) + "\nTick Speed: " + Math.round((this.tps / 45) * 100) + "%")

        //background movement
        this.background.setTilePosition(this.cameras.main.scrollX, this.cameras.main.scrollY);

    }
}

export default GameScene;