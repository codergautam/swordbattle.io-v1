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
          drop: [100,250],
          health: 1
        },
        uncommon: {
          scale: 0.65,
          drop: [250,500],
          health: 25
        },
        rare: {
          scale: 0.75,
          drop: [500,1000],
          health: 50,
        },
        epic: {
          scale: 1,
          drop: [1000,2000],
          health: 100
        },
        legendary: {
          scale: 1.5,
          drop: [2000,5000],
          health: 250
        },
        mythical: {
          scale: 2.25,
          drop: [5000,10000],
          health: 500
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
      var toDrop = getRandomInt(this.drop[0],this.drop[1]);
      var coinSizes = [5,4,3, 2, 1];
      if(toDrop > 500) coinSizes.unshift(15)
      if(toDrop > 1000) coinSizes.unshift(25)
      
      
      // for (var i = 0; i < getRandomInt(this.drop[0],this.drop[1]); i++) {
      //   var x = getRandomInt(this.pos.x, this.pos.x + this.width);
      //   var y = getRandomInt(this.pos.y, this.pos.y + this.height);

      //   drop.push(new Coin({ x: x, y: y }));
      // }
      while (toDrop > 0) {
        // Find biggest coinsize that fits in toDrop
        var usedCoinSize = 0;
        for(var coinSize of coinSizes) {
          if(toDrop >= coinSize) {
            usedCoinSize = coinSize;
            break;
          }
        }
        var x = getRandomInt(this.pos.x, this.pos.x + this.width);
        var y = getRandomInt(this.pos.y, this.pos.y + this.height);
        drop.push(new Coin({ x,y, value: usedCoinSize}));
        toDrop -= usedCoinSize;
      }
      return drop;
    }

  }
  
  module.exports = Chest;