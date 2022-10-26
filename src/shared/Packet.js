module.exports = class Packet {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }

  toBinary() {
    const length = typeof this.data === 'number' ? 1 : this.data.length;
    // Data is an array
    const buffer = Buffer.alloc(4 + length);
    // First byte is type
    buffer[0] = this.type;
    // Second byte is count of data
    buffer[1] = length;
    // Remaining bytes are data
    for (let i = 0; i < buffer[1]; i += 1) {
      const location = 2 + (i * 2);
      buffer.writeUInt16BE(length === 1 ? this.data : this.data[i], location);
    }

    return buffer;
  }

  static get Type() {
    return {
      MOVE: 1,
      ATTACK: 2,
      PLAYER_ID: 10,
      JOIN: 4,
      LEAVE: 5,
      LEADERBOARD: 6,
      OTHER: 7,
    };
  }

  static fromBinary(buffer) {
    // eslint-disable-next-line no-param-reassign
    buffer = Buffer.from(buffer);
    // First byte is type
    const type = buffer[0];
    // Second byte is count of data
    const count = buffer[1];
    // Remaining bytes are data
    const data = [];
    for (let i = 0; i < count; i += 1) {
      const location = 2 + (i * 2);
      data.push(buffer.readUInt16BE(location));
    }

    return { type, data };
  }
};
