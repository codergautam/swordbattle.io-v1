import { WebSocket, WebSocketBehavior } from 'uWebSockets.js';
import packetHandler from './packetHandler';
import idgen, { IDGEN } from '../helpers/idgen';
import Packet from '../../shared/Packet';
import Room from '../classes/Room';
import PacketErrorTypes from '../../shared/PacketErrorTypes';
import roomList from '../helpers/roomlist';
import unjoinedRoom from '../helpers/unjoinedRoom';
import constants from '../helpers/constants';
import { PacketType } from '../../shared/PacketDefinitions';

export interface ISwordsWebSocket extends WebSocket {
  id: IDGEN,
  joinedAt: number
}

const mainRoom = new Room('main');
roomList.addRoom(mainRoom);

setInterval(() => {
  [...unjoinedRoom.clients.values()].forEach((client) => {
    if (client.joinedAt + 10000 < Date.now()) {
      // eslint-disable-next-line max-len
      client.send(new Packet({ type: PacketType.ERROR, data: PacketErrorTypes.JOIN_TIMEOUT.code }).toBinary());
      client.end();
    }
  });
}, 1000);

const behavior: WebSocketBehavior = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  /* other events (upgrade, open, ping, pong, close) */
  open: (ws) => {
    // eslint-disable-next-line no-param-reassign
    ws.id = idgen();
    // eslint-disable-next-line no-param-reassign
    ws.joinedAt = Date.now();
    console.log(`Client ${ws.id} connected`);
    unjoinedRoom.addClient(ws as ISwordsWebSocket);
  },
  close: (ws) => {
    console.log(`Client ${ws.id} disconnected`);
    if (unjoinedRoom.clients.has(ws.id)) {
      unjoinedRoom.removeClient(ws.id);
    } else if (mainRoom.ws.clients.has(ws.id)) {
      mainRoom.removePlayer(ws.id);
    }
  },
  message: (ws, message) => {
    const packet = Packet.fromBinary(message);
    packetHandler(ws as ISwordsWebSocket, packet);
  },
};

export default behavior;

setInterval(() => {
  mainRoom.tick();
}, 1000 / constants.expected_tps);
