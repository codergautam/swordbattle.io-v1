function viewport() {
    var e = window,
        a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {
        width: e[a + 'Width'],
        height: e[a + 'Height']
    }
}

var config = {
    type: Phaser.AUTO,
    width: viewport().width - 10,
    height: viewport().height - 10,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: "#FFFFFF"
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image("player", "/assets/images/player.png")
    this.load.image("sword", "/assets/images/sword.png")
    this.load.image('background', '/assets/images/background.jpeg');

    this.socket = io()
}

function create() {
    //background
    this.background = this.add.tileSprite(0, 0, viewport().width - 10, viewport().height - 10, 'background').setOrigin(0).setScrollFactor(0, 0);
    this.background.fixedToCamera = true;

    //player 
    this.mePlayer = this.add.image(400, 100, "player").setScale(0.25)

    //sword
    this.meSword = this.add.image(400, 100, "sword").setScale(0.25)

    //enemies array
    this.enemyPlayers = []
    this.enemySwords = []

    //arrow keys
    this.cursors = this.input.keyboard.createCursorKeys();

    //camera follow
    this.cameras.main.startFollow(this.mePlayer);

    //go packet
    this.socket.emit("go")

    //mouse down
    this.input.on('pointerdown', function(pointer) {
      if(!this.mouseDown) {
        this.mouseDown = true
        this.socket.emit("mouseDown", true)
      }
    }, this);
    this.input.on('pointerup', function(pointer) {
      if(this.mouseDown) {
        this.mouseDown = false
        this.socket.emit("mouseDown", false)
      }
    }, this);
}

function update() {
    var controller = {left: false, up: false, right: false, down: false}

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
    if(this.mouseDown) old += 30

    var mousePos = this.input

    this.meSword.angle = Math.atan2(mousePos.y - ((viewport().height - 10) / 2), mousePos.x - ((viewport().width - 10) / 2)) * 180 / Math.PI + 45;

    this.meSword.x = this.mePlayer.x + this.mePlayer.width / 6 * Math.cos(this.meSword.angle * Math.PI / 180)
    this.meSword.y = this.mePlayer.y + this.mePlayer.width / 6 * Math.sin(this.meSword.angle * Math.PI / 180)

    if (this.meSword.angle != old) this.socket.emit("angle", this.meSword.angle)
    if (this.mouseDown) this.meSword.angle -= 30

    //server -> client
   const addPlayer = (player) => {
  this.enemyPlayers[this.enemyPlayers.length] = this.add.image(player.pos.x, player.pos.y, "player").setScale(0.25)
this.enemySwords[this.enemySwords.length] = this.add.image(player.pos.x, player.pos.y, "sword").setScale(0.25)
}
    this.socket.on("players", (players) => {
      players.forEach(player=>addPlayer(player))
    })
    this.socket.on("new", (player) => {
        addPlayer(player)
      })
    this.socket.on("myPos", (pos) => {
      this.mePlayer.x = pos.x
      this.mePlayer.y = pos.y
    })

    this.socket.on("pos", (id, pos) => {
        
    })

    //background movement
    this.background.setTilePosition(this.cameras.main.scrollX, this.cameras.main.scrollY);

}

//for debugging on the school chromebooks they fricking banned dev console
window.onerror = function(msg, url, line) {
    document.write("Error : " + msg + "<br><br>");
    document.write("Line number : " + line + "<br><br>");
    document.write("File : " + url);
}