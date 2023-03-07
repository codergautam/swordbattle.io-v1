import getRandomInt from "../helpers/getRandomInt";
import Chest from "./Chest";
import Coin from "./Coin";
import Player from "./Player";
import Room from "./Room";
const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
class AiPlayer extends Player {
    target: any;
  lastHit: number;
  chaseTime: number;
  movementMode: string;
  mouseDown: any;
  mousePos: any;
  lastPlayerFollow: number;
    constructor(id: any, name: any) {
      // var aiName = "Test"
      // // this is because some names have Mr. or Ms. in them
      // if (aiName.length > 2) aiName = aiName[1];
      // else aiName = aiName[0];

        super( name);
        this.ai = true;
        this.id = id;
        this.target = undefined;
        this.lastHit = Date.now();
        this.moveDir = 0;
        this.lastPlayerFollow = Date.now();
        this.chaseTime = 0;
        this.movementMode = "mouse";
        let tf= Math.random();
        let validSkins = ["player", "yinyang", "neon", "sponge", "vortex", "bubble", "bullseye", "fox", "spring"];

        this.setForce(1)

        if (tf > .75){
          this.skin = validSkins[Math.floor(Math.random()* validSkins.length)];
        } else {
          this.skin = "player";
        }
    }
    tick(room: Room) {

      let entities = this.getEntities(room);
if(!this.target || !this.entityExists(this.target, entities)) {
  if(this.lastPlayerFollow > Date.now()) {
    entities = Array.from(room.coins.values());
  }
  this.target = this.getClosestEntity(entities);
  if(this.target.type == "player") this.lastPlayerFollow = Date.now();
}
      if(this.target) {
        // Move towards target
        let tpos = this.getTpos(room);
        if(tpos) {
          let dir = Math.atan2(tpos.y - this.pos.y, tpos.x - this.pos.x);
          this.setMoveDirRadians(dir);
          this.setAngle(dir);
          if(this.target.type == "player") {
            this.chaseTime = Date.now();
            if(this.lastHit + 1000 < Date.now()) {
              this.lastHit = Date.now();
              this.setMouseDown(true)
            } else if(this.lastHit + 200 < Date.now() && this.swinging) {
              this.setMouseDown(false)
            }
            if(this.chaseTime - this.lastPlayerFollow > 5000) {
              this.target = undefined;
              this.lastPlayerFollow = Date.now() + 5000;
            }
          }
        }
      }
    }
    getEntities(room: Room) {
      var players = room.players.array.filter(p=>p && p.id !== this.id && Date.now() - p.joinTime > 5000) as any;
      let coins = Array.from(room.coins.values())
      var entities = players.concat(coins);
      return (this.coins < 5000 && Date.now() - this.joinTime < 5000 ? coins : (this.coins < 5000 ? entities : players));
      //return players
    }
    getTpos(room: Room) {
      try {
      return (this.target?.type == "player" ? room.players.get(this.target.id).pos : this.target.pos);
      } catch(e) {
        return this.target?.pos;
      }
    }
    entityExists(entity: { id: any; }, entities: { filter: (arg0: (f: any) => boolean) => { (): any; new(): any; length: number; }; }) {
      return entities.filter((f: { id: any; })=>f.id == entity.id).length > 0;
    }
    getClosestEntity(entities: any[]) {
      if(entities.length > 0) {
      const distanceFromThis = (pos: { x: number; y: number; }) => Math.hypot(this.pos.x - pos.x, this.pos.y - pos.y);
      var closest = entities.sort((a: { pos: any; },b: { pos: any; })=>distanceFromThis(a.pos)-distanceFromThis(b.pos))[0];
      if(closest.hasOwnProperty("joinTime")) {
        closest = closest.getQuadTreeFormat();
        closest.type = "player";
      } else closest.type ="coin";
      return closest;
    } else return undefined;
}
}

export default AiPlayer;