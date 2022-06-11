const Player = require("./Player");
const PlayerList = require("./PlayerList");
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
const { faker } = require("@faker-js/faker");
const evolutions = require("./evolutions");
class AiPlayer extends Player {
    constructor(id) {
      var aiName = faker.name.findName().split(" ");
      // this is because some names have Mr. or Ms. in them
      if (aiName.length > 2) aiName = aiName[1];
      else aiName = aiName[0];
       
        super(id, aiName);
        this.ai = true;
        this.target = undefined;
        this.lastHit = Date.now();
        this.mousePos.viewport.width = 1000;
        this.mousePos.viewport.height = 1000;
        this.chaseTime = 0;
        this.movementMode = "mouse";
        
    }
    tick(coins, io, levels, chests, flyingSwords) {
      if(PlayerList.deadPlayers.includes(this.id)) {
        PlayerList.deletePlayer(this.id);
      } else {
        try {
const lerp = (x, y, a) => x * (1 - a) + y * a; 
if(!this.target || !this.entityExists(this.target,this.getEntities(coins))) this.target = this.getClosestEntity(this.getEntities(coins, chests));
      if(this.target) {
        if(this.target.type == "player") this.chaseTime += 1;
        if(this.target.type==="player" && Date.now() - this.lastHit > getRandomInt(300, 700) && this.swordInHand) {
          
          if(this.chaseTime > 100) {
            this.target = this.getClosestEntity(coins);
            this.chaseTime = 0;
          }
          //distance from me to target
      
          
          this.lastHit = Date.now();
          if(getRandomInt(1,4) != 1) {
         [coins,chests] = this.down(!this.mouseDown, coins, io, chests);

          } else if(Date.now() - this.lastSwordThrow >= 10000) {
            this.swordInHand = false;
            flyingSwords.push({hit: [], scale: this.scale, x: this.pos.x, y: this.pos.y, time: Date.now(), angle: this.calcSwordAngle(), skin: this.skin, id: this.id});
            this.lastSwordThrow = Date.now();
          }
        } 
        }
        var tPos = this.getTpos();
        this.toSword = {
          x: this.mousePos.viewport.width / 2 + (tPos.x - this.pos.x),
          y: this.mousePos.viewport.height / 2 + (tPos.y - this.pos.y)
      };
        this.mousePos.x = lerp(this.mousePos.x, this.toSword.x, 0.2);
        this.mousePos.y = lerp(this.mousePos.y, this.toSword.y, 0.2);


        // evolution

        if(this.evolutionQueue.length > 0) {
          function randFromArray(arr) {
            return arr[getRandomInt(0, arr.length - 1)];
          }
          var eclass = randFromArray(this.evolutionQueue[0]).toLowerCase();
          this.evolutionQueue.shift();
          var evo = evolutions[eclass];
          console.log(this.name + " evolved to " + eclass);
              
            this.evolutionData = {default: evo.default(), ability: evo.ability()};
          this.evolution =evo.name;
          this.updateValues();
        }

        if(this.evolution != "" && this.ability <= Date.now()) {
          this.ability = evolutions[this.evolution].abilityCooldown + evolutions[this.evolution].abilityDuration + Date.now();
          console.log(this.name + " activated ability");
        }
        this.move();
        coins = this.collectCoins(coins, io, levels);
        } catch(e) {
          PlayerList.deletePlayer(this.id);
          return [coins,chests,flyingSwords];
        }
      }
    //  var controller = this.getController();
    //  this.move(controller);

     return [coins,chests,flyingSwords];
      }
    getController() {
      var controller = {
        left: false,
        right: false,
        up: false,
        down: false
      };
      if(this.target) {
        var tPos = this.getTpos();
      
      if(tPos.x > this.pos.x) controller.right = true;
      if(tPos.x < this.pos.x) controller.left = true;
      if(tPos.y > this.pos.y) controller.down = true;
      if(tPos.y < this.pos.y) controller.up = true;
      }
      return controller;
    }
    getEntities(coins, chests) {
      var players = Object.values(PlayerList.players).filter(p=>p && p.id !== this.id && Date.now() - p.joinTime > 5000);
      var entities = players.concat(coins);
      return (this.coins < 5000 && Date.now() - this.joinTime < 5000 ? coins : (this.coins < 5000 ? entities : players));
    }
    getTpos() {
      try {
      return (this.target.type == "player" ? PlayerList.getPlayer(this.target.id).getSendObj().pos : this.target.pos);
      } catch(e) {
        try {
        return this.target.pos;
        } catch(e) {
          return this.pos;
        }
      }
    }
    entityExists(entity, entities) {
      if(!entities) return false;
      return entities.filter(f=>f && f.id == entity.id).length > 0;
    }
    getClosestEntity(entities) {
      if(entities && entities.length > 0) {
      const distanceFromThis = (pos) => Math.hypot(this.pos.x - pos.x, this.pos.y - pos.y); 
      var closest = entities.sort((a,b)=>distanceFromThis(a.pos)-distanceFromThis(b.pos))[0];
      if(closest.hasOwnProperty("joinTime")) {
        closest = closest.getSendObj();
        closest.type = "player";
      } else if (closest.hasOwnProperty("size")) closest.type="coin";
      else closest.type = "chest";
      return closest;
    } else return undefined;
}
}

module.exports = AiPlayer;