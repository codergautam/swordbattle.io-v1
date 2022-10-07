const intersects = require("intersects");
var map = 15000;
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
  var ID = function () {
    return "_" + Math.random().toString(36).substr(2, 9);
  };
  var clamp = (num, min, max) => Math.min(Math.max(num, min), max);
  class Coin { 
    constructor(pos = {x: getRandomInt(-(map/2),map/2), y: getRandomInt(-(map/2),map/2)}, value= getRandomInt(1,5)) {
      this.id = ID();
      this.size = 20;
      
      this.pos = pos;
      this.value = value;
      //this.value = 100;
      this.size *= clamp(this.value/2,1,3);
      this.radius = ((1.59 *this.size) / 2);
      
    }
    touchingPlayer(player) {
      var rey = player.radius * player.scale * 1.2;
        return intersects.circleEllipse(this.pos.x, this.pos.y, this.radius, player.pos.x, player.pos.y, rey, rey);
    }
    inRange(player) {
      var show = 1500+((300*player.scale)*5);
      var dist = Math.sqrt(Math.pow(this.pos.x - player.pos.x, 2) + Math.pow(this.pos.y - player.pos.y, 2));
        return dist <= show;
    }

  }
  
  module.exports = Coin;