const idgen = require('../helpers/idgen');
const Packet = require('../../shared/Packet');
const WsRoom = require('../classes/WsRoom');
const PacketErrorTypes = require('../../shared/PacketErrorTypes');

const unjoinedRoom = new WsRoom('unjoined');
const mainRoom = new WsRoom('main');

setInterval(() => {
  [...unjoinedRoom.clients.values()].forEach((client) => {
    if (client.joinTime + 5000 < Date.now()) {
      client.emit(Packet.Type.ERROR, PacketErrorTypes.JOIN_TIMEOUT);
      client.close();
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
    ws.send(new Packet(Packet.Type.PLAYER_ID, "kkkk").toBinary());
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

  },
};
