const intersects = require("intersects");
const Coin = require("./Coin");
var map = 10000;
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
  var ID = function () {
    return "_" + Math.random().toString(36).substr(2, 9);
  };
  class Chest { 
    constructor(pos = {x: getRandomInt(-(map/2)+352,(map/2)-223), y: getRandomInt(-(map/2)+352,(map/2)-223)}, rarity="normal") {
      this.id = ID();
      this.rarity = rarity;
      this.raritys = {
        normal: {
          scale: 0.5,
          drop: [20,100],
          health: 1
        },
        rare: {
          scale: 0.75,
          drop: [50,200],
          health: 100,
        },
        epic: {
          scale: 1,
          drop: [100,500],
          health: 200
        },
        legendary: {
          scale: 3,
          drop: [1000,2000],
          health: 1000
        }
      };
      this.width = 352;
      this.height = 223;
      this.scale = this.raritys[this.rarity].scale;
      this.width *= this.scale;
      this.height *= this.scale;
      this.pos = pos;

      this.maxHealth = this.raritys[this.rarity].health;
      this.health = this.maxHealth;

      this.drop = this.raritys[this.rarity].drop;
      
      
    }
    touchingPlayer(player) {
      var rey = player.radius * player.scale * 1.2;
        return intersects.ellipseBox(player.pos.x, player.pos.y, rey, rey, this.pos.x, this.pos.y, this.width, this.height);
    }
    open() {
      var drop = [];
      for (var i = 0; i < getRandomInt(this.drop[0],this.drop[1]); i++) {
        var x = getRandomInt(this.pos.x, this.pos.x + this.width);
        var y = getRandomInt(this.pos.y, this.pos.y + this.height);

        drop.push(new Coin({ x: x, y: y }));
      }
      return drop;
    }

  }
  
  module.exports = Chest;