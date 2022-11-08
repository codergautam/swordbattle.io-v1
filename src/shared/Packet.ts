export default class Packet {
  type: any;
  data: any;

  constructor(type: any, data: any) {
    this.type = type;
    this.data = data;
  }

  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }

  toBinary(json = false) {
    const length = typeof this.data === 'number' ? 1 : this.data.length;
    if (json || (!length || typeof this.data === 'string')) {
      return Buffer.from(JSON.stringify({ t: this.type, d: this.data }), 'utf-8');
    }
    // Data is an array
    const buffer = Buffer.alloc(4 + length);
    // First byte is typ
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
      PLAYER_UPDATE: 0,
      ATTACK: 3,
      PLAYER_ID: 10,
      JOIN: 4,
      LEAVE: 5,
      LEADERBOARD: 6,
      OTHER: 7,
      ERROR: 8,
    };
  }

  static fromBinary(buffer: any) {
    try {
      const { t, d } = JSON.parse(buffer);
      return { type: t, data: d };
    } catch (e) {
      // One more try
      try {
        const { t, d } = JSON.parse(new TextDecoder('utf-8').decode(buffer));
        return { type: t, data: d };
      } catch (e2) {
        // not json
      }
    }
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
}
