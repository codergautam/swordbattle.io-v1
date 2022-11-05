/* eslint-disable no-param-reassign */
import roomList from '../helpers/roomlist';
import Packet from '../../shared/Packet';
import Player from '../classes/Player';
import unjoinedRoom from '../helpers/unjoinedRoom';

const mainRoom = (roomList as any).getRoom('main');

export default (ws: any, packet: any) => {
  switch (packet.type) {
    case Packet.Type.JOIN: {
      // Verify that all data sent is valid
      const { data } = packet;
      // Join the player into main room
      const player = new Player(data.name);
      ws.joinedAt = Date.now();
      unjoinedRoom.removeClient(ws.id);
      mainRoom.addPlayer(player, ws);
      break;
    }
    default:
      break;
  }
};
