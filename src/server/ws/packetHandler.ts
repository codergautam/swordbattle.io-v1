/* eslint-disable no-param-reassign */
import roomList from '../helpers/roomlist';
import Packet from '../../shared/Packet';
import Player from '../classes/Player';
import unjoinedRoom from '../helpers/unjoinedRoom';
import Room from '../classes/Room';

export default (ws: any, packet: any) => {
  const mainRoom = ((roomList as any).getRoom('main') as Room);
  switch (packet.type) {
    case Packet.Type.JOIN: {
      // TODO: Verify that all data sent is valid
      const { data } = packet;
      // Join the player into main room
      const player = new Player(data.name);
      ws.joinedAt = Date.now();
      unjoinedRoom.removeClient(ws.id);
      mainRoom.addPlayer(player, ws);
      break;
    }
    case Packet.Type.PLAYER_MOVE: {
      const { data } = packet;
      const player = mainRoom.getPlayer(ws.id);

      if (player) {
        if (data.d !== undefined) player.setAngle(data.d);
        if (data.m !== undefined) player.setMoveDir(data.m);
        if (data.f !== undefined) player.setForce(data.f);
      }
      break;
    }
    default:
      break;
  }
};
