const idgen = require('../helpers/idgen');
const Packet = require('../../shared/Packet');
const matchmaker = require('../helpers/matchmaker');

module.exports = {
  idleTimeout: 32,
  maxBackpressure: 1024,
  maxPayloadLength: 512,
  /* other events (upgrade, open, ping, pong, close) */
  open: (ws) => {
    console.log(ws);
  },
  message: (ws, m) => {
    const msg = JSON.parse(new TextDecoder().decode(m));
    console.log(msg);
    if (msg.type === Packet.Type.JOIN) {
      const id = idgen();
      // eslint-disable-next-line no-param-reassign
      ws.id = id;
      ws.send(new Packet(Packet.Type.PLAYER_ID, id).toJson());
      matchmaker(ws);
    }
  },
};
