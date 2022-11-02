const QuadTree = require('@timohausmann/quadtree-js');
const Packet = require('../../shared/Packet');
const constants = require('../helpers/constants');
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

    // Initialize quadtree for optimization and collision detection
    const start = -1 * (constants.map / 2);
    this.quadTree = new QuadTree({
      x: start,
      y: start,
      width: constants.map,
      height: constants.map,
    });

    this.lastTick = Date.now();
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.ws.removeClient(playerId);
  }

  refreshQuadTree() {
    this.quadTree.clear();
    this.players.forEach((player) => {
      this.quadTree.insert(player.getQuadTreeFormat());
    });
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
    this.refreshQuadTree();
  }
};
