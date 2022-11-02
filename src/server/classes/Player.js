const constants = require('../helpers/constants');
const getRandomInt = require('../helpers/getRandomInt');

module.exports = class Player {
  constructor(name) {
    this.name = name;
    this.pos = {
      x: getRandomInt(constants.spawn.min, constants.spawn.max),
      y: getRandomInt(constants.spawn.min, constants.spawn.max),
    };
    this.angle = 0;

    this.scale = 1;
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
};
