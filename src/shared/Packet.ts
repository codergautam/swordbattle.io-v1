export interface IPacket {
  type: any;
}

export enum PacketType {
  PLAYER_MOVE = 0,
  PLAYER_ROTATE = 1,
  PLAYER_ADD = 2,
  PLAYER_HEALTH = 10,
  ATTACK = 3,
  PLAYER_ID = 10,
  JOIN = 4,
  LEAVE = 5,
  LEADERBOARD = 6,
  OTHER = 7,
  ERROR = 8,
  PLAYER_REMOVE = 9,
  PLAYER_SWING = 11,
  DIE = 69,
  DEBUG = 100,
}

export interface IPacketError {
  type: typeof PacketType.ERROR;
}

export default class Packet {
  private type: PacketType;
  private data: any;

  constructor(type: PacketType, data: unknown) {
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

  static fromBinary(buffer: ArrayBuffer | string) {
    try {
      if (typeof buffer === 'string') {
        try {
          const { t, d } = JSON.parse(buffer);
          return { type: t, data: d };
        } catch (e) {
          // We're Fricked
        }
      } else {
        try {
          const { t, d } = JSON.parse(new TextDecoder('utf-8').decode(buffer));
          return { type: t, data: d };
        } catch (e2) {
          // not json
        }
      }

      // eslint-disable-next-line no-param-reassign
      const fromBuffer = Buffer.from(buffer as any);
      // First byte is type
      const type: PacketType = fromBuffer[0];
      // Second byte is count of data
      const count = fromBuffer[1];
      // Remaining bytes are data
      const data = [];
      for (let i = 0; i < count; i += 1) {
        const location = 2 + i * 2;
        data.push(fromBuffer.readUInt16BE(location));
      }

      return { type, data };
    } catch (e) {
      console.log(e);
      return { type: PacketType.ERROR };
    }
  }
}
