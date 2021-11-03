const Player = require("./Player")

class AiPlayer extends Player {
    constructor(id) {
        const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
        super(id, randomElement(["PlopyFun", "RoadCode", "32hropat", "Typer32", "McGod", "MitBlade", "Killer", "12345", "Hacker326", "sword", "swordgod", "sword.io", "player", "Alex", "Rajesh", "Ram","Emily", "Steve", "Max", "Lily", "Rohit", "Shiva", "Krishna", "Fan"]))
        this.ai = true;
        this.target = undefined;
    }
    tick(players, coins, io) {

      if(!this.target || !this.entityExists(this.target, this.getEntities(players, coins))) this.target = this.getClosestEntity(this.getEntities(players, coins))
      if(this.target) {
        if(this.target.type==="player") console.log(this.target.name)
        var controller = this.getController()
        players[this.id] = this.move(controller, players)
        var f = this.collectCoins(players, coins, io)
        players = f[0]
        coins = f[1]
      }
      return [players, coins]
      
    }
    getController() {
      var controller = {
        left: false,
        right: false,
        up: false,
        down: false
      }
      var tPos = this.target.pos
      
      if(tPos.x > this.pos.x) controller.right = true
      if(tPos.x < this.pos.x) controller.left = true
      if(tPos.y > this.pos.y) controller.down = true
      if(tPos.y < this.pos.y) controller.up = true

      return controller
    }
    getEntities(players, coins) {
      players = Object.values(players).filter(p=>p.id!== this.id)
      var entities = players.concat(coins)
      return entities
    }
    entityExists(entity, entities) {
      return entities.filter(f=>f.id == entity.id).length > 0
    }
    getClosestEntity(entities) {
      const distanceFromThis = (pos) => Math.hypot(this.pos.x - pos.x, this.pos.y - pos.y); 
      var closest = entities.sort((a,b)=>distanceFromThis(a.pos)-distanceFromThis(b.pos))[0]
      if(closest.hasOwnProperty("joinTime")) {
        closest = closest.getSendObj()
        closest.type = "player"
      } else {
        closest.type ="coin"
      }
      return closest
    }
}

module.exports = AiPlayer