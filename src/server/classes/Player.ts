import Evolutions from '../../shared/Evolutions';
import constants from '../helpers/constants';
import getRandomInt from '../helpers/getRandomInt';

export default class Player {
  name: any;
  pos: any;
  angle: any;
  scale: any;
  evolution: any;
  swinging: any;
  swordThrown: any;
  wsRoom: any;
  id: any;

  constructor(name: any) {
    this.name = name;
    this.pos = {
      x: getRandomInt(constants.spawn.min, constants.spawn.max),
      y: getRandomInt(constants.spawn.min, constants.spawn.max),
    };
    this.angle = 0;
    this.scale = 1;
    this.evolution = Evolutions.DEFAULT;
    this.swinging = false;
    this.swordThrown = false;
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
}
