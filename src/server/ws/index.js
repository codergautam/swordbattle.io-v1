const idgen = require('../helpers/idgen');
const Packet = require('../../shared/Packet');
const WsRoom = require('../classes/WsRoom');

const unjoinedRoom = new WsRoom('unjoined');

module.exports = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  /* other events (upgrade, open, ping, pong, close) */
  open: (ws) => {
    // eslint-disable-next-line no-param-reassign
    ws.id = idgen();
    console.log(`Client ${ws.id} connected`);
    unjoinedRoom.addClient(ws);
    ws.send(new Packet(Packet.Type.PLAYER_ID, [53, 23]).toBinary());
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
