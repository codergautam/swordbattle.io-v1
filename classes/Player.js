class Player { 
  constructor(id) {
    this.id = id
    this.health = 100
    this.pos = {x: 0, y: 0}
    this.kills = 0
    this.speed = 5
    this.mouseDown = false
    this.mousePos = {}
    this.hitbox = {swordPos:{x:undefined,y:undefined},hitPos:{x:undefined,y:undefined}}
    this.size = 75
    this.radius = this.calcRadius()
  }

  move(controller) {
    if(controller.up) this.pos.y -= this.speed
    if(controller.down) this.pos.y += this.speed
    if(controller.right) this.pos.x += this.speed
    if(controller.left) this.pos.x -= this.speed
    return this
  }
  calcRadius() {
    return this.size / 2
  }
}

module.exports = Player