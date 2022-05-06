const Player = require("./Player");
const PlayerList = require("./PlayerList");
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
const { faker } = require("@faker-js/faker");
class AiPlayer extends Player {
    constructor(id) {
      var aiName = faker.name.findName().split(" ");
      // this is because some names have Mr. or Ms. in them
      if (aiName.length > 2) aiName = aiName[1];
      else aiName = aiName[0];
       
        super(id,  aiName);
        this.ai = true;
        this.target = undefined;
        this.lastHit = Date.now();
        this.mousePos.viewport.width = 1000;
        this.mousePos.viewport.height = 1000;
        this.chaseTime = 0;
        this.movementMode = "mouse";
        
    }
    tick(coins, io, levels, chests) {
      if(PlayerList.deadPlayers.includes(this.id)) {
        PlayerList.deletePlayer(this.id);
      } else {
const lerp = (x, y, a) => x * (1 - a) + y * a; 
if(!this.target || !this.entityExists(this.target,this.getEntities(coins))) this.target = this.getClosestEntity(this.getEntities(coins));
      if(this.target) {
        if(this.target.type == "player") this.chaseTime += 1;
        if(this.target.type==="player" && Date.now() - this.lastHit > getRandomInt(300, 700)) {
          
          if(this.chaseTime > 20) {
            this.target = this.getClosestEntity(coins);
            this.chaseTime = 0;
          }
          this.lastHit = Date.now();
         [coins,chests] = this.down(!this.mouseDown, coins, io, chests);
        } 
        var tPos = this.getTpos();
        this.toSword = {
          x: this.mousePos.viewport.width / 2 + (tPos.x - this.pos.x),
          y: this.mousePos.viewport.height / 2 + (tPos.y - this.pos.y)
      };
        this.mousePos.x = lerp(this.mousePos.x, this.toSword.x, 0.2);
        this.mousePos.y = lerp(this.mousePos.y, this.toSword.y, 0.2);

      }
    //  var controller = this.getController();
    //  this.move(controller);
    this.move();
     coins = this.collectCoins(coins, io, levels);
      }
      return [coins,chests];
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
    getEntities(coins) {
      var players = Object.values(PlayerList.players).filter(p=>p && p.id !== this.id && Date.now() - p.joinTime > 5000);
      var entities = players.concat(coins);
      return (this.coins < 5000 && Date.now() - this.joinTime < 5000 ? coins : (this.coins < 5000 ? entities : players));
      //return players
    }
    getTpos() {
      try {
      return (this.target.type == "player" ? PlayerList.getPlayer(this.target.id).getSendObj().pos : this.target.pos);
      } catch(e) {
        return this.target.pos;
      }
    }
    entityExists(entity, entities) {
      return entities.filter(f=>f.id == entity.id).length > 0;
    }
    getClosestEntity(entities) {
      if(entities.length > 0) {
      const distanceFromThis = (pos) => Math.hypot(this.pos.x - pos.x, this.pos.y - pos.y); 
      var closest = entities.sort((a,b)=>distanceFromThis(a.pos)-distanceFromThis(b.pos))[0];
      if(closest.hasOwnProperty("joinTime")) {
        closest = closest.getSendObj();
        closest.type = "player";
      } else closest.type ="coin";
      return closest;
    } else return undefined;
}
}

module.exports = AiPlayer;