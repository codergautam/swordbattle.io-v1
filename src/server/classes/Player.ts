import Quadtree from '@timohausmann/quadtree-js';
import clamp from '../../shared/clamp';
import Evolutions from '../../shared/Evolutions';
import Levels from '../../shared/Levels';
import Packet from '../../shared/Packet';
import constants from '../helpers/constants';
import getRandomInt from '../helpers/getRandomInt';
import Room from './Room';
import WsRoom from './WsRoom';

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
    this.speed = 20;
    this.health = 100;
    this.maxHealth = 100;

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

  getRangeRadius() {
    const radius = (500 + (this.scale * constants.player_radius * 2 * 1.5)) / 2;
    return radius;
  }

  getRangeBounds() {
    const radius = this.getRangeRadius();

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
    this.swinging = s;
    this.updated.swinging = true;
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
    const candidates = quadTree.retrieve(this.getRangeBounds());

    candidates.forEach((elem: any) => {
      if (elem.id === this.id) {
        if (this.updated.pos) this.ws.send(new Packet(Packet.Type.PLAYER_MOVE, this.getMovementInfo()).toBinary(true));
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

    this.lastSeenPlayers.forEach((id: any) => {
      if (!newSeenPlayers.has(id)) {
        this.lastSeenPlayers.delete(id);
        this.ws.send(new Packet(Packet.Type.PLAYER_REMOVE, { id }).toBinary(true));
      }
    });

    this.lastSeenPlayers = newSeenPlayers;
  }
}
