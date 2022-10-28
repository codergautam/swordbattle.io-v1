const idgen = require('../helpers/idgen');
const Packet = require('../../shared/Packet');
const Room = require('../classes/Room');
const PacketErrorTypes = require('../../shared/PacketErrorTypes');
const roomList = require('../helpers/roomlist');
const unjoinedRoom = require('../helpers/unjoinedRoom');

const mainRoom = new Room('main');
roomList.addRoom(mainRoom);

const packetHandler = require('./packetHandler');

setInterval(() => {
  [...unjoinedRoom.clients.values()].forEach((client) => {
    if (client.joinedAt + 10000 < Date.now()) {
      // eslint-disable-next-line max-len
      client.send(new Packet(Packet.Type.ERROR, PacketErrorTypes.JOIN_TIMEOUT.code).toBinary());
      client.end();
    }
  });
}, 1000);

module.exports = {
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
    unjoinedRoom.addClient(ws);
  },
  close: (ws) => {
    console.log(`Client ${ws.id} disconnected`);
    if (unjoinedRoom.clients.has(ws.id)) {
      unjoinedRoom.removeClient(ws.id);
    } else {
      // remove from room
    }
  },
  message: (ws, m) => {
    const packet = Packet.fromBinary(m);
    packetHandler(ws, packet);
  },
};
