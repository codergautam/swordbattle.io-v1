const Packet = require('../../shared/Packet');
const idGen = require('../helpers/idgen');
const WsRoom = require('./WsRoom');

module.exports = class Room {
  constructor(id = idGen()) {
    // eslint-disable-next-line no-param-reassign
    if (typeof id !== 'string' && typeof id !== 'number') id = idGen();
    this.id = id;
    this.ws = new WsRoom(this.id);
    this.players = new Map();
    this.maxPlayers = 4;

    this.lastTick = Date.now();
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.ws.removeClient(playerId);
  }

  addPlayer(player, ws) {
    const ourPlayer = player;
    ourPlayer.roomId = this.id;
    ourPlayer.id = ws.id;
    ourPlayer.wsRoom = this.ws;

    this.players.set(ourPlayer.id, ourPlayer);
    this.ws.addClient(ws);

    // Send a packet to the client to tell them they joined the room
    ws.send(new Packet(Packet.Type.JOIN, ws.id).toBinary());
  }

  tick() {
    const now = Date.now();
    const delta = now - this.lastTick;
    this.lastTick = now;
    console.log(`Room ${this.id} ticked with ${this.players.size} players`);
  }
};
