const intersects = require("intersects")
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1))
}
  var ID = function () {
    return "_" + Math.random().toString(36).substr(2, 9)
  }
  class Coin { 
    constructor(pos = {x: getRandomInt(-2500,2500), y: getRandomInt(-2500,2500)}) {
      this.id = ID()
      this.size = 25
      this.radius = ((1.59 *this.size) / 2)
      this.pos = pos
      
    }
    touchingPlayer(player) {
      const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1) 
      //var rex = distance(player.pos.x, player.pos.y, player.lastPos.x, player.lastPos.y) * 2
      var rey = player.radius * player.scale * 1.2
        return intersects.circleEllipse(this.pos.x, this.pos.y, this.radius, player.pos.x, player.pos.y, rey, rey)
    }

  }
  
  module.exports = Coin