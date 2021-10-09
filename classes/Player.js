class Player { 
  constructor() {
    this.health = 100
    this.pos = {x: 0, y: 0}
    this.kills = 0
    this.speed = 5
    this.mouseDown = false
    this.angle = 0
  }
}

module.exports = Player