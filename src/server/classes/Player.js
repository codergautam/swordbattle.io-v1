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
  }

  get ws() {
    return this.wsRoom.getClient(this.id);
  }
};
