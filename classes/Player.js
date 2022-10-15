var intersects = require("intersects");
const PlayerList = require("./PlayerList");
const Coin = require("./Coin.js");
const {sql} = require("../database");
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
var map = 15000;
const evolutions = require("./evolutions");

class Player { 
  constructor(id, name) {
    this.ai = false;
    this.ranking = false;
    this.movementMode = "mouse";
    this.id = id;
    this.name = name;
    this.health = 100;
    this.coins = 0;
    this.pos = {x: getRandomInt(-250,250), y: getRandomInt(-250,250)};
    this.kills = 0;
    this.speed = 700;
    this.scale = 0.25;
    this.damage = 10;
    this.level = 1;
    this.lastChat = Date.now();
    this.damageCooldown = 200;
    this.verified = false;

    this.swordInHand = true;
    this.lastSwordThrow = 0;

    this.evolutionQueue = [];
    this.evolution = "";
    this.evolutionData = {};

    //note these are hardcoded below in updatevalues() overriding doesn't work
     this.healWait = 5000;
    this.healAmount = 1;
    this.leech = 1;
    // end of hardcoded values

    this.ability = 0;
    this.abilityActive = false;
    
   this.skin = "player";
    this.levelScale = 0.25;

    this.resistance = 20;
    this.power = 200;

    this.maxHealth = 100;
    this.lastPos = this.pos;
    this.lastSwing = Date.now();
    this.joinTime = Date.now();
    this.lastHit = Date.now();
    this.lastRegen = Date.now();
    this.mouseDown = false;
    this.mousePos = {x:0,y:0,viewport:{width:1920,height:1080}};
    this.size = 300;
    this.radius = this.size / 2;
    this.lastMove = Date.now();
  }
  moveWithMouse() {

  if(Date.now() - this.lastMove > 5000) this.lastMove = (Date.now() - 1000); 
    var since =( Date.now() - this.lastMove ) / 1000;
    
    
    var go = since * this.speed;

    const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1); 

    var power = distance(this.mousePos.x, this.mousePos.y, this.mousePos.viewport.width/2, this.mousePos.viewport.height/2);
power = (power/((this.mousePos.viewport.height+this.mousePos.viewport.width)/2))*100;

if(power > 20) power = 100;
else power *= 100/20;

if(power < 15)  power = 0;
go *= power/100;

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    

    var pos = this.movePointAtAngle([this.pos.x, this.pos.y], (this.calcSwordAngle()+45)*Math.PI/180 , go);
    
    this.pos.x = clamp(pos[0], -(map/2), map/2);
    this.pos.y = clamp(pos[1],-(map/2), map/2);


  return this.calcSwordAngle()+45;
  }
  move(controller) {
    function getCardinal(angle) {
      /** 
       * Customize by changing the number of directions you have
       * We have 8
       */
      const degreePerDirection = 360 / 8;
    
      /** 
       * Offset the angle by half of the degrees per direction
       * Example: in 4 direction system North (320-45) becomes (0-90)
       */
      const offsetAngle = angle + degreePerDirection / 2;
    /*

      var o = [45,90,135,-90];
      //get closest angle
      var closest = o[0];
      var closestDiff = Math.abs(o[0] - offsetAngle);
      for(var i = 1; i < o.length; i++) {
        var diff = Math.abs(o[i] - offsetAngle);
        if(diff < closestDiff) {
          closest = o[i];
          closestDiff = diff;
        }
      }
      return closest;
*/
      return (offsetAngle >= 0 * degreePerDirection && offsetAngle < 1 * degreePerDirection) ? 45
        : (offsetAngle >= 1 * degreePerDirection && offsetAngle < 2 * degreePerDirection) ? 90
          : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? 90
            : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? 180-45
              : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? 180-45
                : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? -90
                  : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? -90
                    : -90;
    }

    var players = Object.values(PlayerList.players);
  //  console.log(this.id+" => ("+this.pos.x+", "+this.pos.y+")")
  if(Date.now() - this.lastMove > 5000) this.lastMove = (Date.now() - 1000); 
    var since =( Date.now() - this.lastMove ) / 1000;
    
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    
    var go = since * this.speed;
    if(this.movementMode == "keys") {

    if(this.pos.x <= -(map/2)) controller.left = false;
    if(this.pos.x >= map/2) controller.right = false;
    if(this.pos.y <= -(map/2)) controller.up = false;
    if(this.pos.y >= map/2) controller.down = false;



var move = true;
 if(controller.up) {
    var moveAngle = 0;

   if(controller.right) {
       moveAngle += 45;
   } else if(controller.left) {
      moveAngle -= 45;
   }
      
    } else if(controller.down) {
       moveAngle = 180;

         if(controller.right) {
       moveAngle -= 45;
   } else if(controller.left) {
      moveAngle += 45;
   }
   
    } else if(controller.left) {
      var moveAngle = -90;
    } else if(controller.right) {
      var moveAngle = 90;
    } else {
      var moveAngle = this.calcSwordAngle()+45;
      move = false;
    }

    

    var pos = this.movePointAtAngle([this.pos.x, this.pos.y], (moveAngle)*Math.PI/180 , go);
    
    if(move) {
    this.pos.x = clamp(pos[0], -(map/2), map/2);
    this.pos.y = clamp(pos[1],-(map/2), map/2);
    }

    if(this.pos.x <= -(map/2)) this.pos.x = -(map/2);
    if(this.pos.x >= map/2) this.pos.x = map/2;
    if(this.pos.y <= -(map/2)) this.pos.y = -(map/2);
    if(this.pos.y >= map/2) this.pos.y = map/2;

    moveAngle = getCardinal(moveAngle);  

    } else {
      var moveAngle = getCardinal(this.moveWithMouse());
    }
   // console.log(players.filter(player=> player.id != this.id && player.touchingPlayer(this)))

      var collidingPlayers = players.filter(player=> player && player.id != this.id && player.touchingPlayer(this));
      collidingPlayers.forEach((player) => {
        let angle = Math.atan2(this.pos.y - player.pos.y, this.pos.x - player.pos.x);
        let playerSize = player.size * player.scale;
        let radius = this.radius * this.scale;
        this.pos.x = player.pos.x + Math.cos(angle) * (radius + playerSize / 2);
        this.pos.y = player.pos.y + Math.sin(angle) * (radius + playerSize / 2);
      });
      
    

    this.lastMove = Date.now();
    PlayerList.updatePlayer(this);
  }
  movePointAtAngle(point, angle, distance) {
    return [
        point[0] + (Math.sin(angle) * distance),
        point[1] - (Math.cos(angle) * distance)
    ];
  }
  doKnockback(player, angle=player.calcSwordAngle()) {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    
    var oldPos = this.pos;

  var pos = this.movePointAtAngle([this.pos.x, this.pos.y], (angle+45)*Math.PI/180 , Math.max(player.power-this.resistance,50));
    
    this.pos.x = clamp(pos[0], -(map/2), map/2);
    this.pos.y = clamp(pos[1],-(map/2), map/2);

    if(this.touchingPlayer(player)) {
      this.pos = oldPos;
    }
  }
  collectCoins(coins, io, levels) {
    

           var touching = coins.filter((coin) => coin.touchingPlayer(this));

        touching.forEach((coin) => {
          //this.coins += (this.ai?coin.value:140);
          this.coins+= coin.value;
          if(this.level <= levels.length && this.coins >= levels[this.level-1].coins) {
            //lvl up!
  

            var oldLevel = this.level;
          var levelsPassed = [];
                //calculate new level
                levels.forEach((level, i) => {
                  if(this.coins >= level.coins) {
                    if(i+2 > this.level) levelsPassed.push(level);
                    this.level = i+2;
                    this.scale = level.scale;
                    this.levelScale = level.scale;
                  }
                });
              
                var evoLevels = levelsPassed.slice(oldLevel-this.level).filter(level => level.evolutions)?.map((e)=>e.evolutions).map((e)=>e.map((f)=>f.name));
                this.evolutionQueue = [...this.evolutionQueue, ...evoLevels].filter((e)=>e);
              
                if(levelsPassed.length > 0) this.checkSubEvolutions();
            
          }


          var index = coins.findIndex((e) => e.id == coin.id);
          coins.splice(index, 1);

          this.updateValues();
          io.sockets.send("collected", [coin.id, this.id, true]);
        });


      return coins;
  }
  checkSubEvolutions() {
    if(
      evolutions[this.evolution] 
      && evolutions[this.evolution].subEvolutions 
      && evolutions[this.evolution].subEvolutions.length > 2 
      && evolutions[this.evolution].subEvolutions[0] <= this.coins 
      && this.evolutionQueue.findIndex((q) => q[0] == evolutions[this.evolution].subEvolutions[1] && q[1] == evolutions[this.evolution].subEvolutions[2]) == -1
      ) this.evolutionQueue.push(evolutions[this.evolution].subEvolutions.slice(1).map((e)=>e.name));

  }
  hittingPlayer(player) {

  
  var deep = 0;
  var angles = [-5,0,5,10,15,25,30,35,40,45, 50,55];

  for (const increment of angles) {

    var angle = this.calcSwordAngle();
    angle -= increment;
   
    var sword = {x: 0, y: 0};
    var factor = (100/(this.scale*100))*1.5;
    sword.x = this.pos.x + (this.size / factor * Math.cos(angle * Math.PI / 180));
    sword.y = this.pos.y + (this.size/ factor * Math.sin(angle * Math.PI / 180));

  var tip = this.movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale)*0.8);
  var base = this.movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale)*-1.5);

                          //get the values needed for line-circle-collison
                       
                          var radius = player.radius *player.scale;

                          //check if enemy and player colliding
                          if(intersects.lineCircle(tip[0], tip[1], base[0], base[1], player.pos.x, player.pos.y, radius)) return true;

  }
return false;
  }
  touchingPlayer(player) {
        return intersects.circleCircle(this.pos.x, this.pos.y, (this.radius*this.scale)*0.8, player.pos.x, player.pos.y, (player.radius*player.scale)*0.9);
  }
  calcSwordAngle() {
    return Math.atan2(this.mousePos.y - (this.mousePos.viewport.height / 2), this.mousePos.x - (this.mousePos.viewport.width / 2)) * 180 / Math.PI + 45;
  }
  inRange(player) {
    var show = 1500+((300*player.scale)*3);
    var dist = Math.sqrt(Math.pow(this.pos.x - player.pos.x, 2) + Math.pow(this.pos.y - player.pos.y, 2));
      return dist <= show;
  }
  updateValues() {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    const convert = (num, val, newNum) => (newNum * val) / num;
    var percent = this.health / this.maxHealth;
    this.scale = this.levelScale;
    this.maxHealth = this.scale * 400;
    this.health = percent * this.maxHealth;
    this.damage =  (80 * this.scale > 30 ? 30 +(((80 * this.scale) - 30) / 5) : 80 * this.scale );
    this.speed = clamp(740 -  (this.scale* 160),350,570);

    this.power = convert(0.25, 200, this.scale);
    this.resistance = convert(0.25, 20, this.scale);

    this.damageCooldown = (50 + (this.level * 12))*2;
    this.healAmount = 1;
    this.healWait = 5000;
    this.leech =1;

    if(Object.keys(this.evolutionData).length > 0) {
      Object.keys(this.evolutionData.default).forEach((prop) => {
       if(this.hasOwnProperty(prop)) this[prop] *= this.evolutionData.default[prop];
      });
      if(this.ability > Date.now() +evolutions[this.evolution].abilityCooldown) {
      //  console.log("ability",this.ability);
        Object.keys(this.evolutionData.ability).forEach((prop) => {
         if(this.hasOwnProperty(prop)) this[prop] *= this.evolutionData.ability[prop];
        });
        this.abilityActive = true;

      } else this.abilityActive = false;
    }

    if(!this.swordInHand) { 
      this.speed *= 1.5;
   this.resistance /= 1.5;
 this.maxHealth /= 1.5;
   this.health /= 1.5;
   this.damage *= 0.5;
   this.power *= 0.8;

    }

  }
  down(down, coins, io, chests) {
    this.mouseDown = down;
    return this.checkCollisions(coins,chests, io);
  }
  dealHit(enemy, coins, io, angle) {
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    var socketById = io.sockets.sockets.get(enemy.id);
    var socket = io.sockets.sockets.get(this.id);
    //if colliding

    if(this.ai) {
      this.target = this.getClosestEntity(this.getEntities(coins));
      PlayerList.updatePlayer(this);
    } 
    if(enemy.ai) {
      enemy.target = enemy.getClosestEntity(coins);
    PlayerList.updatePlayer(enemy);
    } 


    if(Date.now() - enemy.joinTime >= 5000) {
    enemy.lastHit = Date.now();
    var oldHealth = enemy.health;
    enemy.health -= this.damage;
    if (enemy.health <= 0 && oldHealth * 2 >= enemy.maxHealth)
      enemy.health = enemy.maxHealth * 0.1;

      this.health += (this.leech-1) * (oldHealth - Math.max(0, enemy.health));
      if(this.health > this.maxHealth) this.health = this.maxHealth;

    if (enemy.health <= 0) {
      if(!this.ai && socket) socket.send("dealHit", [enemy.id]);
      if(!enemy.ai && socketById) socketById.send("takeHit", [this.id]);
      //enemy has 0 or less than 0 health, time to kill
    if(!enemy.ai) sql`INSERT INTO games (name, coins, kills, time, verified, killedby, killerverified) VALUES (${enemy.name}, ${enemy.coins}, ${enemy.kills}, ${Date.now() - enemy.joinTime}, ${enemy.verified}, ${this.name}, ${this.verified})`;

      //increment killcount by 1
      this.kills += 1;

      //tell clients that this enemy died
      if(!enemy.ai && socketById) {

        
        
      socketById.send("youDied", {
        killedBy: this.name,
        killerVerified: this.verified,
        killedById: this.id,
        timeSurvived: Date.now() - enemy.joinTime,
      });
    
      socketById.broadcast.send("playerDied", [enemy.id, {
        killedBy: {id: this.id, name: this.name},
      }]);
      } else {
        io.sockets.send("playerDied", [enemy.id, {
          killedBy: {id: this.id, name: this.name},
        }]);
      }
      //drop their coins
      var drop = [];
      var dropAmount = enemy.coins < 13 ? 10 : Math.round(enemy.coins < 25000 ? enemy.coins * 0.8 : Math.log10(enemy.coins) * 30000 - 111938.2002602);
      var dropped = 0;
      while (dropped < dropAmount) {
        var r = enemy.radius * enemy.scale * Math.sqrt(Math.random());
        var theta = Math.random() * 2 * Math.PI;
        var x = enemy.pos.x + r * Math.cos(theta);
        var y = enemy.pos.y + r * Math.sin(theta);
        var remaining = dropAmount - dropped;
        var value = remaining > 50 ? 50 : (remaining > 10 ? 10 : (remaining > 5 ? 5 : 1));

        coins.push(
          new Coin({
            x: clamp(x, -(map/2), map/2),
            y: clamp(y, -(map/2), map/2),
          },value)
        );
        dropped += value;
        drop.push(coins[coins.length - 1]);
      }

        io.sockets.send("coin", [drop, [enemy.pos.x, enemy.pos.y]]);
      
      //log a message
      console.log(this.name+" killed " + enemy.name);

      //delete the enemy
      PlayerList.deletePlayer(enemy.id);

      //disconnect the socket
    // if(!enemy.ai && socketById) socketById.disconnect();
    } else {
      enemy.doKnockback(this, angle);
      if(!this.ai && socket) socket.send("dealHit", [enemy.id, enemy.pos]);
      if(!enemy.ai && socketById) socketById.send("takeHit", [this.id, this.pos]);
    }
  } else {
    enemy.doKnockback(this, angle);
    if(!this.ai && socket) socket.send("dealHit", [enemy.id]);
    if(!enemy.ai && socketById) socketById.send("takeHit", [this.id]);
  }
  return coins;
  }
  checkCollisions(coins, chests, io) {
    //hit cooldown

        
    if (this.mouseDown && Date.now() - this.lastSwing > this.damageCooldown) {
      this.lastSwing = Date.now();
      Object.values(PlayerList.players).forEach((enemy) => {
        //loop through all enemies, make sure the enemy isnt the player itself
        if (enemy && enemy.id != this.id && !PlayerList.deadPlayers.includes(enemy.id)) {
          //get the values needed for line-circle-collison
          //check if enemy and player colliding
          if (
            this.hittingPlayer(enemy)
          ) {
            coins = this.dealHit(enemy,coins,io);
        }
        }
      });


    
          //chest collisions
          chests.forEach((chest) => {
            if (this.hittingChest(chest)) {
              const convert = (num, val, newNum) => (newNum * val) / num;

              // default damage cooldown gets 1 damage per hit
              var chestDmg = Math.round(convert(140, 1, this.damageCooldown));
              if(this.level >= 10) chestDmg *= 2;
              if(this.level >= 25) chestDmg *= 2;
              chest.health -= chestDmg;
              io.sockets.send("chestHealth", [chest.id, chest.health, this.id]);
              if(chest.health <= 0) {
              //remove the chest
              chests.splice(chests.indexOf(chest), 1);
              io.sockets.send("collected", [chest.id, this.id, false]);
    
              //drop coins at that spot
              var drop = chest.open();
    
              io.sockets.send("coin", [drop, [chest.pos.x+(chest.width/2), chest.pos.y+(chest.height/2)]]);
                coins.push(...drop);
              }
            }
          });
        }
    return [coins, chests];
  }

  hittingChest(chest) {
    var angles = [-5,0,5,10,15,25,30,35,40,45, 50,55];
    for (const increment of angles) {

      var angle = this.calcSwordAngle();
      angle -= increment;
     
      var sword = {x: 0, y: 0};
      var factor = (100/(this.scale*100))*1.5;
      sword.x = this.pos.x + (this.size / factor * Math.cos(angle * Math.PI / 180));
      sword.y = this.pos.y + (this.size/ factor * Math.sin(angle * Math.PI / 180));
  
    var tip = this.movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale));
    var base = this.movePointAtAngle([sword.x, sword.y], ((angle+45) * Math.PI / 180), (this.radius*this.scale)*-1.5);
  
        if( intersects.lineBox(tip[0], tip[1], base[0], base[1], chest.pos.x, chest.pos.y, chest.width, chest.height)) return true;
    }
  return false;
  }


  getSendObj() {
    return {swordInHand: this.swordInHand, skin: this.skin, abilityActive: this.abilityActive, evolution: this.evolution,verified: this.verified, damageCooldown: this.damageCooldown, joinTime: this.joinTime, skin: this.skin, id: this.id, name:this.name, health:this.health, coins: this.coins,pos:this.pos, speed:this.speed,scale:this.scale,maxHealth: this.maxHealth, mouseDown: this.mouseDown, mousePos: this.mousePos, ranking: this.ranking};
  }
}

module.exports = Player;
