module.exports = class Packet {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }

  toJson() {
    return JSON.stringify({ type: this.type, data: this.data });
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
