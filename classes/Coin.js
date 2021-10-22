
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
  var ID = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
  };
  class Coin { 
    constructor() {
      this.id = ID()
      this.size = 25
      this.radius = ((1.59 *this.size) / 2)
      this.pos = {x: getRandomInt(-2500,2500), y: getRandomInt(-2500,2500)}
      
    }
    touchingPlayer(player) {
        const checkCollision = (p1x, p1y, r1, p2x, p2y, r2) => ((r1 + r2) ** 2 > (p1x - p2x) ** 2 + (p1y - p2y) ** 2)
        return checkCollision(this.pos.x, this.pos.y, this.radius, player.pos.x, player.pos.y, player.radius*player.scale)
    }

  }
  
  module.exports = Coin