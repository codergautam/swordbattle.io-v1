
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
class Player { 
  constructor(id, name) {
    this.id = id
    this.name = name
    this.health = 100
    this.pos = {x: getRandomInt(-250,250), y: getRandomInt(-250,250)}
    this.lastPos = this.pos
    this.lastDamageDealt = Date.now()
    this.kills = 0
    this.speed = 300
    this.joinTime = Date.now()
    this.lastHit = Date.now()
    this.lastRegen = Date.now()
    this.mouseDown = false
    this.mousePos = {x:0,y:0,viewport:{width:1920,height:1080}}
    this.hitbox = {swordPos:{x:undefined,y:undefined},hitPos:{x:undefined,y:undefined}}
    this.size = 300
    this.scale = 0.25
    this.radius = this.calcRadius()
    this.lastMove = Date.now()
  }

  move(controller, players) {
    var players = Object.values(players)
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

    if(diagnol == 0) go = 0.707 * go

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
    if(players.filter(player=> player.id != this.id && player.touchingPlayer(this)).length > 0) this.pos = {x: last.x, y:last.y}
    
    if(last.x != this.pos.x || last.y != this.pos.y) this.lastPos = {x: last.x, y: last.y}

    this.lastMove = Date.now()
    
    return this
  }
  calcHitbox() {
    function movePointAtAngle(point, angle, distance) {
      return [
          point[0] + (Math.sin(angle) * distance),
          point[1] - (Math.cos(angle) * distance)
      ];
  }

    var angle = Math.atan2(this.mousePos.y - (this.mousePos.viewport.height / 2), this.mousePos.x - (this.mousePos.viewport.width / 2)) * 180 / Math.PI + 45;
    
    if (this.mouseDown) angle -= 30
   
    var sword = {x: 0, y: 0}
    var factor = (100/(this.scale*100))*1.5
    sword.x = this.pos.x + (this.size / factor * Math.cos(angle * Math.PI / 180))
    sword.y = this.pos.y + (this.size/ factor * Math.sin(angle * Math.PI / 180))
  this.hitbox.swordPos = sword;
console.log(this.radius*this.scale)
  var hitArr = movePointAtAngle([sword.x, sword.y], angle * Math.PI / 180, (this.radius*this.scale)*1.5)
 this.hitbox.hitPos.x = hitArr[0]
 this.hitbox.hitPos.y = hitArr[1]


  }
  calcRadius() {
    return this.size / 2
  }
  touchingPlayer(player) {
          const checkCollision = (p1x, p1y, r1, p2x, p2y, r2) => ((r1 + r2) ** 2 > (p1x - p2x) ** 2 + (p1y - p2y) ** 2)
        return checkCollision(this.pos.x, this.pos.y, this.radius*this.scale, player.pos.x, player.pos.y, player.radius*player.scale)
  }
}

module.exports = Player