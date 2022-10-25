module.exports = class Packet {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }

  toBinary() {
    // Data is a number
    if (typeof this.data === 'number') {
      return Buffer.from([this.type, this.data]);
    }
    throw new Error('Invalid data type');
  }

  static get Type() {
    return {
      MOVE: 1,
      ATTACK: 2,
      PLAYER_ID: 3,
      JOIN: 4,
      LEAVE: 5,
      LEADERBOARD: 6,
      OTHER: 7,
    };
  }
};
