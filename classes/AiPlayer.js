const CoinList = require("./CoinList");
const Player = require("./Player")
const PlayerList = require("./PlayerList")
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
class AiPlayer extends Player {
    constructor(id) {
        const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
        super(id, randomElement(["PlopyFun", "RoadCode", "32hropat", "Typer32", "McGod", "MitBlade", "Killer", "12345", "Hacker326", "sword", "swordgod", "sword.io", "player", "Alex", "Rajesh", "Ram","Emily", "Steve", "Max", "Lily", "Rohit", "Shiva", "Krishna", "Fan", "Liam", "Noah", "Emma", "Olivia", "mollthecoder", "RayhanADev", "amasad", "Elon Musk", "Jeff Bezos", "ur bad LMAO", "killsword", "swordKILLER", "EvasiveCollecter", "123asd", "Name", "Yeet", "Idiot", "Tamil", "Hindi", "Telugu", "Kannada", "Malayalam", "USA", "Pakistan", "Malaysia", "UAE", "Enter name", "Hero", "Warrior", "Timewaster", "Game0ver", "Demonatic","Borrowed_Time", "Gemfinder", "Wolfblood", "Qakqueen", "Sympathyyy", "CuriousGeorgia", "Silvester", "Millennial0", "Checkm8"]))
        this.ai = true;
        this.target = undefined;
        this.lastHit = Date.now()
        this.mousePos.viewport.width = 1000
        this.mousePos.viewport.height = 1000
        
    }
    tick(io, levels) {
      if(PlayerList.deadPlayers.includes(this.id)) {
        PlayerList.deletePlayer(this.id)
      } else {
const lerp = (x, y, a) => x * (1 - a) + y * a; 
if(!this.target || !this.entityExists(this.target,this.getEntities())) this.target = this.getClosestEntity(this.getEntities())
      if(this.target) {
        
        if(this.target.type==="player" && Date.now() - this.lastHit > getRandomInt(100, 700)) {
          this.lastHit = Date.now()
         this.down(!this.mouseDown, io)
        } 
        var tPos = this.getTpos()
        this.toSword = {
          x: this.mousePos.viewport.width / 2 + (tPos.x - this.pos.x),
          y: this.mousePos.viewport.height / 2 + (tPos.y - this.pos.y)
      }
        this.mousePos.x = lerp(this.mousePos.x, this.toSword.x, 0.2)
        this.mousePos.y = lerp(this.mousePos.y, this.toSword.y, 0.2)

      }
      var controller = this.getController()
      this.move(controller)
     this.collectCoins(io, levels)
      }
     
    }
    getController() {
      var controller = {
        left: false,
        right: false,
        up: false,
        down: false
      }
      if(this.target) {
        var tPos = this.getTpos()
      
      if(tPos.x > this.pos.x) controller.right = true
      if(tPos.x < this.pos.x) controller.left = true
      if(tPos.y > this.pos.y) controller.down = true
      if(tPos.y < this.pos.y) controller.up = true
      }
      return controller
    }
    getEntities() {
      var players = Object.values(PlayerList.players).filter(p=>p && p.id !== this.id && Date.now() - p.joinTime > 5000)
      var entities = players.concat(CoinList.coins)
      
      return (this.coins < 5000 && Date.now() - this.joinTime < 5000 ? CoinList.coins : (this.coins < 5000 ? entities : players))
      //return players
    }
    getTpos() {
      try {
      return (this.target.type == "player" ? PlayerList.getPlayer(this.target.id).getSendObj().pos : this.target.pos)
      } catch(e) {
        return this.target.pos
      }
    }
    entityExists(entity, entities) {
      return entities.filter(f=>f.id == entity.id).length > 0
    }
    getClosestEntity(entities) {
      if(entities.length > 0) {
      const distanceFromThis = (pos) => Math.hypot(this.pos.x - pos.x, this.pos.y - pos.y); 
      var closest = entities.sort((a,b)=>distanceFromThis(a.pos)-distanceFromThis(b.pos))[0]
      if(closest.hasOwnProperty("joinTime")) {
        closest = closest.getSendObj()
        closest.type = "player"
      } else closest.type ="coin"
      return closest
    } else return undefined
}
}

module.exports = AiPlayer