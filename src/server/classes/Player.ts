import Quadtree from '@timohausmann/quadtree-js';
import intersects from 'intersects';
import clamp from '../../shared/clamp';
import Evolutions from '../../shared/Evolutions';
import Levels from '../../shared/Levels';
import Packet from '../../shared/Packet';
import constants from '../helpers/constants';
import getRandomInt from '../helpers/getRandomInt';
import Room from './Room';
import WsRoom from './WsRoom';
import roomlist from '../helpers/roomlist';
import Coin from './Coin'
import movePointAtAngle from '../helpers/movePointAtAngle';

export default class Player {
  name: string;
  pos: { x: number; y: number };
  angle: number;
  scale: number;
  evolution: any;
  swinging: boolean;
  swordThrown: boolean;
  wsRoom!: WsRoom;
  id: any;
  force: number;
  moveDir: number;
  updated: { pos: boolean; rot: boolean; health: boolean; swinging: boolean };
  speed: number;
  lastSeenPlayers: Set<any>;
  roomId: string | number | undefined;
  health: number;
  maxHealth: number;
  xp: number;
  kills: number;
  killer: string;

  constructor(name: any) {
    this.name = name;
    this.roomId = undefined;
    this.pos = {
      x: getRandomInt(constants.spawn.min, constants.spawn.max),
      y: getRandomInt(constants.spawn.min, constants.spawn.max),
    };
    this.moveDir = 0;
    this.angle = 0;
    this.force = 0;
    this.scale = Levels[0].scale;
    this.evolution = Evolutions.DEFAULT;
    this.swinging = false;
    this.swordThrown = false;
    this.speed = 15;
    this.health = 100;
    this.maxHealth = 100;
    this.xp = 0;
    this.kills = 0;
    this.killer = '';
    this.lastSeenPlayers = new Set();

    this.updated = {
      pos: false,
      rot: false,
      health: false,
      swinging: false,
    };
  }

  get healthPercent() {
    return clamp(this.health / this.maxHealth, 0, 1) * 100;
  }

  get room() {
    return roomlist.getRoom(this.roomId);
  }

  getRangeRadius(hit = false) {
    const base = (this.scale * constants.player_radius * 2);
    const radius = hit ? base : ((500 + (base * 1.5)) / 2);
    return radius;
  }

  getRangeBounds(hit = false) {
    const radius = this.getRangeRadius(hit);

    return {
      x: this.pos.x - radius,
      y: this.pos.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  setAngle(angle: number) {
    // Make sure angle is number
    const angle1 = Number(angle);
    if (Number.isNaN(angle)) return;
    if (angle1 < -Math.PI && angle1 > Math.PI) return;
    if (this.angle !== angle1) {
      this.angle = angle1;
      this.updated.rot = true;
    }
  }

  setForce(force: number) {
    const force1 = Number(force);

    if (Number.isNaN(force1) || force1 > 1 || force1 < 0) return;
    this.force = force1;
  }

  setMoveDir(moveDir: number) {
    // Convert to radians
    const moveDir1 = Number(moveDir);
    if (Number.isNaN(moveDir1)) return;
    if (moveDir < -360 && moveDir > 360) return;
    this.moveDir = (moveDir * Math.PI) / 180;
  }

  setMouseDown(s: boolean) {
    //  TODO: Add cooldown
    if (this.swinging !== s) {
      this.swinging = s;
      this.updated.swinging = true;
      if (this.swinging) this.hitCheck();
    }
  }

  hitCheck() {
    const room = this.room as Room;
    const rangeBounds = this.getRangeBounds(true);
    room.quadTree.retrieve(rangeBounds).forEach((playerObj: any) => {
      const player = room.getPlayer(playerObj.id) as Player;
      if (player === undefined) {
        const coin = room.getCoin(playerObj.id) as Coin;
        if (coin.hittingPlayer(this)) {
          this.collectCoin(coin);
        }
      } else {
        if (player.id === this.id) return;
        if (this.hittingPlayer(player)) {
          player.takeHit(this);
        }
      }
    });
  }

  takeHit(player: Player) {
    this.health -= player.damage;
    this.updated.health = true;
    player.dealKnockback(this);
    if (this.health <= 0) {
      player.increaseKillCounter();
      this.killer = player.name;
      this.die();
    }
  }

  increaseKillCounter() {
    this.kills += 1;
  }

  die() {
    this.ws.send(new Packet(Packet.Type.DIE, [this.kills, this.killer]).toBinary(true));
    this.room.removePlayer(this.id);
  }

  calcSwordAngle() {
    return (this.angle * 180) / Math.PI + 45;
  }

  hittingPlayer(player: Player) {
    const deep = 0;
    const angles = [-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30];
    // const pts = [];

    for (const increment of angles) {
      let angle = this.calcSwordAngle();

      angle -= increment;

      const sword = { x: 0, y: 0 };
      const factor = (100 / (this.scale * 100)) * 1.5;
      sword.x = this.pos.x + ((this.radius / factor) * Math.cos((angle * Math.PI) / 180));
      sword.y = this.pos.y + ((this.radius / factor) * Math.sin((angle * Math.PI) / 180));

      const tip = movePointAtAngle([sword.x, sword.y], (((angle + 45) * Math.PI) / 180), (this.radius) * 0.2);
      const base = movePointAtAngle([sword.x, sword.y], (((angle + 45) * Math.PI) / 180), (this.radius / 2) * 1.7);

      // get the values needed for line-circle-collison
      // pts.push(tip, base);

      const radius = player.radius * player.scale * 2;

      // check if enemy and player colliding
      if (intersects.lineCircle(tip[0], tip[1], base[0], base[1], player.pos.x, player.pos.y, radius)) return true;
    }
    // this.ws.send(new Packet(Packet.Type.DEBUG, pts).toBinary(true));
    return false;
  }

  dealKnockback(player: Player) {
    const minKb = 10;
    const maxKb = 500;
    // calculate kb by my scale and their scale
    let kb = ((this.scale) / (player.scale)) * 100;
    kb = clamp(kb, minKb, maxKb);
    const x = Math.cos(this.angle) * kb;
    const y = Math.sin(this.angle) * kb;
    // eslint-disable-next-line no-param-reassign
    player.pos.x += x;
    // eslint-disable-next-line no-param-reassign
    player.pos.y += y;
  }

  getMovementInfo() {
    return {
      pos: this.pos,
      id: this.id,
    };
  }

  getQuadTreeFormat() {
    return {
      x: this.pos.x,
      y: this.pos.y,
      width: this.radius * 2,
      height: this.radius * 2,
      id: this.id,
    };
  }

  get ws() {
    return this.wsRoom.getClient(this.id);
  }

  get radius() {
    return constants.player_radius * this.scale;
  }

  get damage() {
    return (80 * this.scale > 30 ? 30 + (((80 * this.scale) - 30) / 5) : 80 * this.scale);
  }

  getFirstSendData() {
    return {
      name: this.name,
      x: this.pos.x,
      y: this.pos.y,
      angle: this.angle,
      scale: this.scale,
      evolution: this.evolution,
      swinging: this.swinging,
      swordThrown: this.swordThrown,
      id: this.id,
      health: this.healthPercent,
    };
  }

  moveUpdate(delta: number) {
    // Update position based on movement direction and speed
    const expDel = (1000 / constants.expected_tps);
    const moveSpeed = this.speed * this.force * (expDel / delta);

    const newPos = {
      x: Number((this.pos.x + (Math.cos(this.moveDir) * moveSpeed)).toFixed(2)),
      y: Number((this.pos.y + (Math.sin(this.moveDir) * moveSpeed)).toFixed(2)),
    };

    newPos.x = clamp(newPos.x, -1 * (constants.map / 2), constants.map / 2);
    newPos.y = clamp(newPos.y, -1 * (constants.map / 2), constants.map / 2);

    // Check if position has changed

    if (this.pos.x !== newPos.x || this.pos.y !== newPos.y) {
      this.pos = newPos;
      this.updated.pos = true;

      const room = this.room as Room;
      room.quadTree.retrieve(this.getRangeBounds(true)).forEach((playerObj) => {
        const player = room.getPlayer((playerObj as any).id) as Player;
        if (player === undefined) return;
        if (player.id === this.id) return;
        // eslint-disable-next-line max-len
        const cc = (p1x: number, p1y: number, r1: any, p2x: number, p2y: number, r2: any) => ((r1 + r2) ** 2 > (p1x - p2x) ** 2 + (p1y - p2y) ** 2);
        if (!cc(this.pos.x, this.pos.y, this.radius / 2, player.pos.x, player.pos.y, player.radius / 2)) return;
        const angle = Math.atan2(this.pos.y - player.pos.y, this.pos.x - player.pos.x);
        this.pos.x = player.pos.x + Math.cos(angle) * (this.radius / 2 + player.radius / 2) * 0.9;
        this.pos.y = player.pos.y + Math.sin(angle) * (this.radius / 2 + player.radius / 2) * 0.9;
      });
    }
  }

  isInRangeWith(otherPlayer: Player) {
    const radius = this.getRangeRadius();
    const otherRadius = otherPlayer.getRangeRadius();

    const distance = Math.sqrt(
      (this.pos.x - otherPlayer.pos.x) ** 2 + (this.pos.y - otherPlayer.pos.y) ** 2,
    );

    return distance < radius + otherRadius;
  }

  packets(room: Room) {
    const { quadTree } = room;
    if (!quadTree) return;
    const newSeenPlayers = new Set();
    const newSeenCoins = new Set();
    const candidates = quadTree.retrieve(this.getRangeBounds());

    candidates.forEach((elem: any) => {
      if (elem.id === this.id) {
        if (this.updated.pos) this.ws.send(new Packet(Packet.Type.PLAYER_MOVE, this.getMovementInfo()).toBinary(true));
        // eslint-disable-next-line max-len
        if (this.updated.health) this.ws.send(new Packet(Packet.Type.PLAYER_HEALTH, { id: this.id, health: this.healthPercent }).toBinary(true));
        return;
      }

      const player = room.getPlayer(elem.id);

      if (!player || !this.isInRangeWith(player)) return;

      if (!this.lastSeenPlayers.has(player.id)) {
        this.lastSeenPlayers.add(player.id);
        this.ws.send(new Packet(Packet.Type.PLAYER_ADD, player.getFirstSendData()).toBinary(true));
      } else if (player.updated.pos) {
        this.ws.send(new Packet(Packet.Type.PLAYER_MOVE, player.getMovementInfo()).toBinary(true));
      }
      if (player.updated.rot) {
        this.ws.send(new Packet(Packet.Type.PLAYER_ROTATE, { id: player.id, r: player.angle }).toBinary(true));
      }
      if (player.updated.health) {
        // eslint-disable-next-line max-len
        this.ws.send(new Packet(Packet.Type.PLAYER_HEALTH, { id: player.id, health: player.healthPercent }).toBinary(true));
      }
      if (player.updated.swinging) {
        this.ws.send(new Packet(Packet.Type.PLAYER_SWING, { id: player.id, s: player.swinging }).toBinary(true));
      }
      newSeenPlayers.add(player.id);
    });
    
    candidates.forEach((elem: any) => {
      const coin = room.getCoin(elem.id);
      
      if (!coin || !coin.isInRangeWith(this)) return;
      
      this.ws.send(new Packet(Packet.Type.COIN, { id: coin.id, position: coin.pos }).toBinary(true));
      console.log("sent coin thingy...");
      if (coin.hittingPlayer(this)) {
        this.ws.send(new Packet(Packet.Type.COIN_COLLECT, { id:coin.id }).toBinary(true));
      }
    });
    
    this.lastSeenPlayers.forEach((id: any) => {
      if (!newSeenPlayers.has(id)) {
        this.lastSeenPlayers.delete(id);
        this.ws.send(new Packet(Packet.Type.PLAYER_REMOVE, { id }).toBinary(true));
      }
    });

    this.lastSeenPlayers = newSeenPlayers;
  }
  
  collectCoin(coin: any) {
    const room = this.room as Room;
    
    this.xp += coin.value;
    room.removeCoin(coin.id);
  }
}
