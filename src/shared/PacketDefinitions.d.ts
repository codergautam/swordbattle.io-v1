import Player from '../server/classes/Player';
import { ISwordsWebSocket } from '../server/ws';
import { IPacketErrorData } from './PacketErrorTypes';
import { IControllerUpdateData } from '../client/components/game/helpers/controller';

export enum PacketType {
  PLAYER_MOVE = 0,
  PLAYER_ROTATE = 1,
  PLAYER_ADD = 2,
  PLAYER_HEALTH = 10,
  PLAYER_VECTOR = 13,
  ATTACK = 3,
  PLAYER_ID = 12,
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

interface IPacketBase {
  type: PacketType;
  data?: unknown;
}

interface IPacketPlayerJoin extends IPacketBase {
  type: PacketType.JOIN;
  data: { // Should be moved to the Room class
    id: ISwordsWebSocket['id'];
    positionX: Player['pos']['x'];
    positionY: Player['pos']['y'];
  };
}

interface IPacketPlayerDie extends IPacketBase {
  type: PacketType.DIE;
  data: Record<string, never>;
}

interface IPacketPlayerMove extends IPacketBase {
  type: PacketType.PLAYER_MOVE;
  data: ReturnType<Player['getMovementInfo']>;
}

interface IPacketPlayerVector extends IPacketBase {
  type: PacketType.PLAYER_VECTOR;
  data: IControllerUpdateData;
}

interface IPacketPlayerHealth extends IPacketBase {
  type: PacketType.PLAYER_HEALTH;
  data: ReturnType<Player['getHealthInfo']>;
}

interface IPacketPlayerAdd extends IPacketBase {
  type: PacketType.PLAYER_ADD;
  data: ReturnType<Player['getFirstSendData']>;
}

interface IPacketPlayerRotate extends IPacketBase {
  type: PacketType.PLAYER_ROTATE;
  data: ReturnType<Player['getRotationInfo']>
}

interface IPacketPlayerSwing extends IPacketBase {
  type: PacketType.PLAYER_SWING;
  data: ReturnType<Player['getSwingInfo']>;
}

interface IPacketPlayerRemove extends IPacketBase {
  type: PacketType.PLAYER_REMOVE;
  data: {
    id: ISwordsWebSocket['id']
  }
}

interface IPacketError extends IPacketBase {
  type: PacketType.ERROR;
  data?: IPacketErrorData['code'];
}

// eslint-disable-next-line max-len
export type IPacket = IPacketPlayerJoin | IPacketPlayerDie | IPacketPlayerMove | IPacketPlayerVector | IPacketPlayerHealth | IPacketPlayerAdd | IPacketPlayerRotate | IPacketPlayerSwing | IPacketPlayerRemove | IPacketError;
