import Evolutions from '../../shared/Evolutions';
import Packet from '../../shared/Packet';
import constants from '../helpers/constants';
import getRandomInt from '../helpers/getRandomInt';
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
  updated: { angle: boolean; scale: boolean; moveDir: boolean; speed: boolean; force: boolean; };
  speed: number;

  constructor(name: any) {
    this.name = name;
    this.pos = {
      x: getRandomInt(constants.spawn.min, constants.spawn.max),
      y: getRandomInt(constants.spawn.min, constants.spawn.max),
    };
    this.moveDir = 0;
    this.angle = 0;
    this.force = 0;
    this.scale = 1;
    this.evolution = Evolutions.DEFAULT;
    this.swinging = false;
    this.swordThrown = false;
    this.speed = 20;

    this.updated = {
      angle: false,
      scale: false,
      moveDir: false,
      speed: false,
      force: false,
    };
  }

  setAngle(angle: number) {
    this.angle = angle;
    this.updated.angle = true;
  }

  setForce(force: number) {
    this.force = force;
    this.updated.force = true;
  }

  setMoveDir(moveDir: number) {
    // Convert to radians
    this.moveDir = (moveDir * Math.PI) / 180;
    this.updated.moveDir = true;
  }

  getMovementInfo() {
    return {
      dir: this.moveDir,
      force: Number((this.force * this.speed).toFixed(2)),
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
    };
  }

  get ws() {
    return this.wsRoom.getClient(this.id);
  }

  get radius() {
    return constants.player_radius * this.scale;
  }

  tick(delta: number) {
    // Update position based on movement direction and speed
    const expDel = (1000 / constants.expected_tps);
    const moveSpeed = this.speed * this.force * (expDel / delta);
    this.pos.x = Number((this.pos.x + (Math.cos(this.moveDir) * moveSpeed)).toFixed(2));
    this.pos.y = Number((this.pos.y + (Math.sin(this.moveDir) * moveSpeed)).toFixed(2));

    if (this.updated.moveDir || this.updated.speed || this.updated.force) {
      this.updated.moveDir = false;
      this.updated.speed = false;
      this.updated.force = false;
      this.ws.send(new Packet(Packet.Type.PLAYER_MOVE, this.getMovementInfo()).toBinary(true));
    }
    // if (this.updated.angle) {
    //   this.updated.angle = false;
    //   // Convert to degrees
    //   this.ws.send(new Packet(Packet.Type.PLAYER_ROTATE, Number(this.angle.toFixed(2))).toBinary(true));
    // }
  }
}
