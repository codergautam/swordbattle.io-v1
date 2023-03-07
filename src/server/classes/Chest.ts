import constants from '../helpers/constants';
import getRandomInt from '../helpers/getRandomInt';
import intersects from 'intersects';
import Player from './Player';
import Coin from './Coin';
import idGen from '../helpers/idgen';

function getTypeRandomly() {
  let rand = Math.random();
  let found = constants.chest_ratio.findIndex((ratio) => {
    return ratio < rand;
  }) + 1
  if(found === 0) found++;
  return found;
}


export default class Chest {
  pos: { x: number; y: number };
  id: number;
  type: number;
  scale: number;
  drop: number[];
  health: number;
  width: number;
  height: number;
  maxHealth: number;
  updated: { health: boolean; };
  lastSent: number;

  constructor(id: number, type: number = getTypeRandomly()) {
    this.type = type;
    let raritys = [
      {
        scale: 0.5,
        drop: [50,100],
        health: 1
      },
      {
        scale: 0.65,
        drop: [100,250],
        health: 25
      },
      {
        scale: 0.75,
        drop: [250,500],
        health: 50,
      },
      {
        scale: 1,
        drop: [500,1000],
        health:  150
      },
      {
        scale: 1.5,
        drop: [1000,2500],
        health: 350
      },
      {
        scale: 2.25,
        drop: [5000,10000],
        health: 750
      }
    ];

    this.scale = raritys[type-1].scale;
    this.drop = raritys[type-1].drop;
    this.health = raritys[type-1].health;
    this.maxHealth = this.health;
    this.updated = {
      health: true
    }

    this.lastSent = 0;
    this.width = 352;
    this.height = 223;
    // WHY /2 ? I don't know, but it works
    this.width = this.width * this.scale /2;
    this.height = this.height * this.scale /2;

    this.pos = {
      x: getRandomInt(constants.spawn.min + this.width, constants.spawn.max - this.width),
      y: getRandomInt(constants.spawn.min + this.height, constants.spawn.max - this.height)
    };

    this.id = id;
  }

  touchingPlayer(player: Player) {
    var rey = player.radius * player.scale * 1.2;
      return intersects.ellipseBox(player.pos.x, player.pos.y, rey, rey, this.pos.x, this.pos.y, this.width, this.height);
  }

  getRangeRadius() {
    return Math.sqrt(this.width ** 2 + this.height ** 2) / 2;
  }

  open() {
    var drop = [];
    var toDrop = getRandomInt(this.drop[0],this.drop[1]);
    var coinSizes = [5,4,3, 2, 1];
    if(toDrop > 500) coinSizes.unshift(15);
    if(toDrop > 1000) coinSizes.unshift(25);
    if(toDrop > 5000) coinSizes.unshift(50);
    console.log("you just broke a type " + this.type + " chest and got " + toDrop + " coins")

    while (toDrop > 0) {
      // Find biggest coinsize that fits in toDrop
      var usedCoinSize = coinSizes.find((c)=>toDrop>=c) as number;
      var x = getRandomInt(this.pos.x, this.pos.x + this.width);
      var y = getRandomInt(this.pos.y, this.pos.y + this.height);
      drop.push(new Coin(idGen.getID(),usedCoinSize, { x: x, y: y }));
      toDrop -= usedCoinSize;
    }
    return drop;
  }

  hit(by: Player) {
    this.health -= by.damage;
    this.updated.health = true;
    if(this.health <= 0) {
      return this.open();
    }
    return [];
  }

  isInRangeWith(player: any) {
    const radius = this.getRangeRadius();
    const otherRadius = player.getRangeRadius();

    const distance = Math.sqrt(
      (this.pos.x - player.pos.x) ** 2 + (this.pos.y - player.pos.y) ** 2,
    );

    return distance < radius + otherRadius;
  }

  getQuadTreeFormat() {
    return {
      x: this.pos.x,
      y: this.pos.y,
      width: this.width,
      height: this.height,
      id: this.id,
    };
  }
}