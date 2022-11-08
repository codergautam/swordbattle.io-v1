import QuadTree from '@timohausmann/quadtree-js';
import Packet from '../../shared/Packet';
import constants from '../helpers/constants';
import idGen from '../helpers/idgen';
import Player from './Player';
import WsRoom from './WsRoom';

export default class Room {
  id: string | number;
  ws: any;
  players: Map<any, Player>;
  maxPlayers: any;
  quadTree: any;
  lastTick: any;

  constructor(id = idGen() as string | number) {
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

  removePlayer(playerId: any) {
    this.players.delete(playerId);
    this.ws.removeClient(playerId);
  }

  refreshQuadTree() {
    this.quadTree.clear();
    this.players.forEach((player: any) => {
      this.quadTree.insert(player.getQuadTreeFormat());
    });
  }

  addPlayer(player: any, ws: any) {
    const ourPlayer = player;
    ourPlayer.roomId = this.id;
    ourPlayer.id = ws.id;
    ourPlayer.wsRoom = this.ws;

    this.players.set(ourPlayer.id, ourPlayer);
    this.ws.addClient(ws);
    // Send a packet to the client to tell them they joined the room, along with position
    ws.send(new Packet(Packet.Type.JOIN, [ws.id, ourPlayer.pos.x, ourPlayer.pos.y]).toBinary(true));
  }

  getPlayer(playerId: any) {
    return this.players.get(playerId);
  }

  tick() {
    const now = Date.now();
    const delta = now - this.lastTick;
    this.lastTick = now;
    this.refreshQuadTree();

    // Iterate over all players in map
    this.players.forEach((player: any) => {
      player.tick(delta);
    });
  }
}
