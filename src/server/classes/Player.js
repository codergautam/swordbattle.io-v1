module.exports = class Player {
  constructor(name) {
    this.name = name;
    this.id = undefined;
    this.roomId = undefined;

    this.pos = { x: 0, y: 0 };
    this.angle = 0;
  }
};
