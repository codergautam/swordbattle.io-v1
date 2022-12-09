import QuadTree from '@timohausmann/quadtree-js';
import { WebSocket } from 'uWebSockets.js';
import Packet, { PacketType } from '../../shared/Packet';
import constants from '../helpers/constants';
import idGen from '../helpers/idgen';
import Player from './Player';
import WsRoom from './WsRoom';

export type RoomID = string | number;

export default class Room {
  public id: RoomID;
  ws: WsRoom;
  players: Map<any, Player>;
  maxPlayers: any;
  quadTree: QuadTree;
  lastTick: any;

  constructor(id: RoomID = idGen()) {
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

  addPlayer(player: Player, ws: WebSocket) {
    const ourPlayer = player;
    ourPlayer.roomId = this.id;
    ourPlayer.id = ws.id;
    ourPlayer.wsRoom = this.ws;

    this.players.set(ourPlayer.id, ourPlayer);
    this.ws.addClient(ws);
    // Send a packet to the client to tell them they joined the room, along with position
    ws.send(new Packet(PacketType.JOIN, [ws.id, ourPlayer.pos.x, ourPlayer.pos.y]).toBinary(true));

    // Find all other players nearby and send them to the client
    const candidates = this.quadTree.retrieve(ourPlayer.getRangeBounds());
    candidates.forEach((candidate: any) => {
      if (candidate.id !== ourPlayer.id) {
        const candidatePlayer = this.players.get(candidate.id);
        if (candidatePlayer && ourPlayer.isInRangeWith(candidatePlayer)) {
          ws.send(new Packet(PacketType.PLAYER_ADD, candidatePlayer.getFirstSendData()).toBinary(true));
          ourPlayer.lastSeenPlayers.add(candidate.id);
        }
      }
    });
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
    this.players.forEach((player: Player) => {
      player.moveUpdate(delta);
    });

    this.players.forEach((player: Player) => {
      player.packets(this);
    });

    // eslint-disable-next-line no-param-reassign
    this.players.forEach((player: Player) => {
      const p = this.players.get(player.id);
      if (p) {
        Object.keys(p.updated).forEach((key) => {
          (p.updated as any)[key] = false;
        });
      }
    });
  }
}
