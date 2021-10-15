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
  this.ready = false;
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
  this.dots = []

  //arrow keys
  this.cursors = this.input.keyboard.createCursorKeys();

  //camera follow
  this.cameras.main.startFollow(this.mePlayer);

  //go packet
  this.socket.emit("go")

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

  //server -> client
  const addPlayer = (player) => {

    this.enemyPlayers[this.enemyPlayers.length] = {
      item: this.add.image(player.pos.x, player.pos.y, "player").setScale(0.25),
      id: player.id
    }
    this.enemySwords[this.enemySwords.length] = {
      item: this.add.image(player.pos.x, player.pos.y, "sword").setScale(0.25),
      id: player.id,
      down: false
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
  this.socket.on("myPos", (pos) => {
    this.mePlayer.x = pos.x
    this.mePlayer.y = pos.y
  })

  this.socket.on("move", (id, pos) => {
    if (!this.ready) return
    var enemyPlayer = this.enemyPlayers.find(enemyPlayer => enemyPlayer.id == id).item
    var enemySword = this.enemySwords.find(enemySword => enemySword.id == id).item

    enemyPlayer.x = pos.x
    enemyPlayer.y = pos.y

    enemySword.x = enemyPlayer.x + enemyPlayer.width / 6 * Math.cos(enemySword.angle * Math.PI / 180)
    enemySword.y = enemyPlayer.y + enemyPlayer.width / 6 * Math.sin(enemySword.angle * Math.PI / 180)
  })

  this.socket.on("mousePos", (id, mousePos) => {
    var enemyPlayer = this.enemyPlayers.find(enemyPlayer => enemyPlayer.id == id).item
    var enemySword = this.enemySwords.find(enemySword => enemySword.id == id).item


    enemySword.angle = Math.atan2(mousePos.y - ((mousePos.viewport.height - 10) / 2), mousePos.x - ((mousePos.viewport.width - 10) / 2)) * 180 / Math.PI + 45;
    if (this.enemySwords.find(enemySword => enemySword.id == id).down) {

      enemySword.angle -= 30
    }

    enemySword.x = enemyPlayer.x + enemyPlayer.width / 6 * Math.cos(enemySword.angle * Math.PI / 180)
    enemySword.y = enemyPlayer.y + enemyPlayer.width / 6 * Math.sin(enemySword.angle * Math.PI / 180)
  })
  this.socket.on("down", (id, down) => {

    this.enemySwords.find(enemySword => enemySword.id == id).down = down

  })
  this.socket.on("playerLeave", (id) => {
    this.enemySwords.find(enemySword => enemySword.id == id).item.destroy()
    this.enemyPlayers.find(enemyPlayer => enemyPlayer.id == id).item.destroy()
    delete this.enemySwords.find(enemySword => enemySword.id == id)
    delete this.enemyPlayers.find(enemyPlayer => enemyPlayer.id == id)
  })
  this.socket.on("hitbox", (hitbox) => {
   // this.add.circle(hitbox.hitPos.x, hitbox.hitPos.y, 10, 0x00FFFF)
  })
}

function update() {
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

  this.meSword.angle = Math.atan2(mousePos.y - ((viewport().height - 10) / 2), mousePos.x - ((viewport().width - 10) / 2)) * 180 / Math.PI + 45;

  if (this.mouseDown) this.meSword.angle -= 30
  this.meSword.x = this.mePlayer.x + this.mePlayer.width / 6 * Math.cos(this.meSword.angle * Math.PI / 180)
  this.meSword.y = this.mePlayer.y + this.mePlayer.width / 6 * Math.sin(this.meSword.angle * Math.PI / 180)

  var mousePos2 = {
    viewport: viewport(),
    x: mousePos.x,
    y: mousePos.y
  }
  if (this.meSword.angle != old) this.socket.emit("mousePos", mousePos2)


function movePointAtAngle (point, angle, distance) {
    return [
        point[0] + (Math.sin(angle) * distance),
        point[1] - (Math.cos(angle) * distance)
    ];
}
  var x1 = this.meSword.x
  var y1 = this.meSword.y

  var position = movePointAtAngle([x1,y1], this.meSword.angle*Math.PI/180, 50)

  //yes i know this is hackable im too lazy pls dont create a hack if you do then you have no life im a child ok
this.socket.emit("hitbox",{swordPos:{x:x1,y:y1},hitPos:{x:position[0],y:position[1]}})
//better health/killing/respawning coming soon :D
if(this.ready) {
if(!this.socket.connected) document.write("you got killed lmao refresh to rejoin")
this.ready = false
}
  //background movement
  this.background.setTilePosition(this.cameras.main.scrollX, this.cameras.main.scrollY);

}


//for debugging on the school chromebooks they fricking banned dev console
window.onerror = function (msg, url, line) {
  document.write("Error : " + msg + "<br><br>");
  document.write("Line number : " + line + "<br><br>");
  document.write("File : " + url);
}