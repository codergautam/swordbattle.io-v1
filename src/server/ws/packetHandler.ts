/* eslint-disable no-param-reassign */
import roomList from '../helpers/roomlist';
import Player from '../classes/Player';
import unjoinedRoom from '../helpers/unjoinedRoom';
import { ISwordsWebSocket } from '.';
import { IPacket, PacketType } from '../../shared/PacketDefinitions';

const packetHandler = (ws: ISwordsWebSocket, packet: IPacket) => {
  const mainRoom = (roomList.getRoom('main'));
  switch (packet.type) {
    case PacketType.JOIN: {
      // TODO: Verify that all data sent is valid
      const { data } = packet;
      // Join the player into main room
      const player = new Player(data.name);
      ws.joinedAt = Date.now();
      unjoinedRoom.removeClient(ws.id);
      mainRoom.addPlayer(player, ws);
      break;
    }
    case PacketType.PLAYER_VECTOR: {
      const { data } = packet;
      const player = mainRoom.getPlayer(ws.id);

      if (player) {
        if (data.d !== undefined) player.setAngle(data.d);
        if (data.m !== undefined) player.setMoveDir(data.m);
        if (data.f !== undefined) player.setForce(data.f);
        if (data.md !== undefined) player.setMouseDown(data.md);
      }
      break;
    }
    default:
      break;
  }
};

export default packetHandler;
