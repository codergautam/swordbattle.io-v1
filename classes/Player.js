var intersects = require("intersects")
const PlayerList = require("./PlayerList")
const Coin = require("./Coin.js")
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
class Player { 
  constructor(id, name) {
    this.ai = false
    this.id = id
    this.name = name
    this.health = 100
    this.coins = 10
    this.pos = {x: getRandomInt(-250,250), y: getRandomInt(-250,250)}
    this.kills = 0
    this.speed = 700
    this.scale = 0.25
    this.damage = 10

    this.resistance = 20
    this.power = 200

    this.maxHealth = 100
    this.lastPos = this.pos
    this.lastDamageDealt = Date.now()
    this.joinTime = Date.now()
    this.lastHit = Date.now()
    this.lastRegen = Date.now()
    this.mouseDown = false
    this.mousePos = {x:0,y:0,viewport:{width:1920,height:1080}}
    this.size = 300
    this.radius = this.size / 2
    this.lastMove = Date.now()
  }
  moveWithMouse(players) {
/*
    var players = Object.values(players)
  //  console.log(this.id+" => ("+this.pos.x+", "+this.pos.y+")")
  if(Date.now() - this.lastMove > 5000) this.lastMove = (Date.now() - 1000) 
    var since =( Date.now() - this.lastMove ) / 1000
    
    
    var go = since * this.speed * 2
 
    var last = {x: this.pos.x, y: this.pos.y}
var pos =  this.movePointAtAngle([this.pos.x, this.pos.y],this.calcSwordAngle()*Math.PI/180+70, go)
this.pos.x = pos[0]
this.pos.y = pos[1]

    if(this.pos.x <= -2500) this.pos.x = -2500
    if(this.pos.x >= 2500) this.pos.x = 2500
    if(this.pos.y <= -2500) this.pos.y = -2500
    if(this.pos.y >= 2500) this.pos.y = 2500

   // console.log(players.filter(player=> player.id != this.id && player.touchingPlayer(this)))
    if(players.filter(player=> player.id != this.id && player.touchingPlayer(this)).length > 0) this.pos = {x: last.x, y:last.y}
    
    if(last.x != this.pos.x || last.y != this.pos.y) this.lastPos = {x: last.x, y: last.y}

    this.lastMove = Date.now()
*/
  }
  move(controller) {
    var players = Object.values(PlayerList.players)
  //  console.log(this.id+" => ("+this.pos.x+", "+this.pos.y+")")
  if(Date.now() - this.lastMove > 5000) this.lastMove = (Date.now() - 1000) 
    var since =( Date.now() - this.lastMove ) / 1000
    
    
    var go = since * this.speed
    var diagnol = 0;

    if(this.pos.x <= -2500) controller.left = false
    if(this.pos.x >= 2500) controller.right = false
    if(this.pos.y <= -2500) controller.up = false
    if(this.pos.y >= 2500) controller.down = false

    if(controller.up || controller.down) diagnol += 1
    if(controller.right || controller.left) diagnol += 1

    if(diagnol > 0) go = 0.707 * go

    go = Math.round(go)
    var last = {x: this.pos.x, y: this.pos.y}

    if(controller.up) this.pos.y -= go
    if(controller.down) this.pos.y += go
    if(controller.right) this.pos.x += go
    if(controller.left) this.pos.x -= go

    if(this.pos.x <= -2500) this.pos.x = -2500
    if(this.pos.x >= 2500) this.pos.x = 2500
    if(this.pos.y <= -2500) this.pos.y = -2500
    if(this.pos.y >= 2500) this.pos.y = 2500

   // console.log(players.filter(player=> player.id != this.id && player.touchingPlayer(this)))
    if(players.filter(player=> player && player.id != this.id && player.touchingPlayer(this)).length > 0) this.pos = {x: last.x, y:last.y}
    
    if(last.x != this.pos.x || last.y != this.pos.y) this.lastPos = {x: last.x, y: last.y}

    this.lastMove = Date.now()
    PlayerList.updatePlayer(this)
  }
  movePointAtAngle(point, angle, distance) {
    return [
        point[0] + (Math.sin(angle) * distance),
        point[1] - (Math.cos(angle) * distance)
    ];
  }
  doKnockback(player) {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    var pos = this.movePointAtAngle([this.pos.x, this.pos.y], (player.calcSwordAngle()+45)*180/Math.PI , player.power-this.resistance)
    this.pos.x = clamp(pos[0], -2500, 2500)
    this.pos.y = clamp(pos[1],-2500, 2500)
  }
  collectCoins(coins, io) {
           var touching = coins.filter((coin) => coin.touchingPlayer(this));

        touching.forEach((coin) => {
          this.coins += 1;
          if (this.scale > 7.5) var increase = 0.01;
          else if (this.scale > 5) var increase = 0.001;
          else var increase = 0.0005;
          this.scale += increase;
          var index = coins.findIndex((e) => e.id == coin.id);
          coins.splice(index, 1);

          this.updateValues();
          io.sockets.emit('collected', coin.id, this.id);
        });

        if (this.scale >= 10) {
          //yay you have conquered the map!
          if(!this.ai) {
          var socketById = io.sockets.sockets.get(this.id);
          socketById.emit('youWon', {
            timeSurvived: Date.now() - this.joinTime,
          });
          socketById.broadcast.emit('playerDied', this.id);
          } else {
io.sockets.emit('playerDied', this.id)
          }

          //delete the player
          PlayerList.deletePlayer(this.id)

          //disconnect the player
          if(!this.ai) socketById.disconnect();
        }
      return coins
  }
  hittingPlayer(player) {

  
  var deep = 0;
  var angles = [-5,0,5,10,15,25,30,35,40,45, 50,55]

  for (const increment of angles) {

    var angle = this.calcSwordAngle()
    angle -= increment
   
    var sword = {x: 0, y: 0}
    var factor = (100/(this.scale*100))*1.5
    sword.x = this.pos.x + (this.size / factor * Math.cos(angle * Math.PI / 180))
    sword.y = this.pos.y + (this.size/ factor * Math.sin(angle * Math.PI / 180))

  var tip = this.movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale))
  var base = this.movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale)*-1.5)

                          //get the values needed for line-circle-collison
                       
                          var radius = player.radius *player.scale

                          //check if enemy and player colliding
                          if(intersects.lineCircle(tip[0], tip[1], base[0], base[1], player.pos.x, player.pos.y, radius)) return true

  }
return false
  }
  touchingPlayer(player) {
        return intersects.circleCircle(this.pos.x, this.pos.y, (this.radius*this.scale)*0.5, player.pos.x, player.pos.y, (player.radius*player.scale)*0.5)
  }
  calcSwordAngle() {
    return Math.atan2(this.mousePos.y - (this.mousePos.viewport.height / 2), this.mousePos.x - (this.mousePos.viewport.width / 2)) * 180 / Math.PI + 45;
  }
  updateValues() {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    const convert = (num, val, newNum) => (newNum * val) / num
    this.maxHealth = this.scale * 400
    this.damage = 80 * this.scale
    this.speed = clamp(740 - (convert(0.25, 1, this.scale) * 40),200,700)

    this.power = convert(0.25, 200, this.scale)
    this.resistance = convert(0.25, 20, this.scale)
  }
  down(down, coins, io) {
    this.mouseDown = down;
    return this.checkCollisions(coins, io)
  }
  checkCollisions(coins, io) {
    //hit cooldown
    if(PlayerList.deadPlayers.includes(this.id)) return coins
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    if (this.mouseDown && Date.now() - this.lastDamageDealt > 1000 / 7) {
      Object.values(PlayerList.players).forEach((enemy) => {
        //loop through all enemies, make sure the enemy isnt the player itself
        if (enemy && enemy.id != this.id) {
          //get the values needed for line-circle-collison
          //check if enemy and player colliding

          if (
            this.hittingPlayer(enemy) &&
            Date.now() - enemy.joinTime >= 5000
          ) {
            var socketById = io.sockets.sockets.get(enemy.id);
            var socket = io.sockets.sockets.get(this.id);
            if(!this.ai) socket.emit('dealHit', enemy.id);
            if(!enemy.ai) socketById.emit('takeHit', this.id);
            //if colliding
            this.lastDamageDealt = Date.now();
            enemy.lastHit = Date.now();
            var oldHealth = enemy.health;
            enemy.health -= this.damage;
            if (enemy.health <= 0 && oldHealth * 2 >= enemy.maxHealth)
              enemy.health = enemy.maxHealth * 0.1;
            if (enemy.health <= 0) {
              //enemy has 0 or less than 0 health, time to kill

              //increment killcount by 1
              this.kills += 1;

              //tell clients that this enemy died
              if(!enemy.ai) {
              socketById.emit('youDied', {
                killedBy: this.name,
                timeSurvived: Date.now() - enemy.joinTime,
              });
            
              socketById.broadcast.emit('playerDied', enemy.id, {
                killedBy: this.name,
              });
              } else {
                io.sockets.emit('playerDied', enemy.id, {
                  killedBy: this.name,
                });
              }
              //drop their coins
              var drop = []
              for (var i = 0; i < clamp(enemy.coins, 5, enemy.coins); i++) {
                var r = enemy.radius * enemy.scale * Math.sqrt(Math.random());
                var theta = Math.random() * 2 * Math.PI;
                var x = enemy.pos.x + r * Math.cos(theta);
                var y = enemy.pos.y + r * Math.sin(theta);

                coins.push(
                  new Coin({
                    x: clamp(x, -2500, 2500),
                    y: clamp(y, -2500, 2500),
                  })
                );
                drop.push(coins[coins.length - 1])
              }
              if(!enemy.ai) {
              socketById.broadcast.emit('coin', drop);
              } else {
                io.sockets.emit('coin', drop)
              }
              //log a message
              console.log('player died -> ' + enemy.id);

              //delete the enemy
              PlayerList.deletePlayer(enemy.id)

              //disconnect the socket
              if(!enemy.ai) socketById.disconnect();
            } else {
              enemy.doKnockback(this);
            }
          }
        }
      });
    }
    return coins
  }
  getSendObj() {
    return {id: this.id, name:this.name, health:this.health, coins: this.coins,pos:this.pos, speed:this.speed,scale:this.scale,maxHealth: this.maxHealth, mouseDown: this.mouseDown, mousePos: this.mousePos}
  }
}

module.exports = Player