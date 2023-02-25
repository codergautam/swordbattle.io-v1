import QuadTree from '@timohausmann/quadtree-js';
import Packet from '../../shared/Packet';
import constants from '../helpers/constants';
import idGen from '../helpers/idgen';
import Player from './Player';
import WsRoom from './WsRoom';
import Coin from './Coin';
import ObjectManager from '../../shared/lib/ObjectManager';
import { SPacketWriter } from '../packets/packet';
import { StreamWriter } from '../../shared/lib/BitStream';

export default class Room {
    id: string | number;
    ws: any;
    // players: Map<any, Player>;
    players: ObjectManager<Player>;
    maxPlayers: any;
    coins: Map<number, Coin>;
    maxCoins: number;
    quadTree: QuadTree;
    lastTick: any;

    constructor(id: string) {
        // eslint-disable-next-line no-param-reassign
        // if (typeof id !== 'string' && typeof id !== 'number') id = idGen();
        this.id = id;
        this.ws = new WsRoom(this.id);
        this.players = new ObjectManager();
        this.maxPlayers = 4;
        this.coins = new Map();
        this.maxCoins = constants.max_coins;

        for (let i = 0; i < this.maxCoins; i++) {
            const id = idGen.getID();
            this.coins.set(id, new Coin(id));
        }

        // Initialize quadtree for optimization and collision detection
        /*
        We will set up the map from starting at 0,0 to map.width, map.height
        This is the conventional way and will work best with networking (we can use unsigned bits)
        */
        // const start = -1 * (constants.map / 2);
        this.quadTree = new QuadTree({
            x: 0,
            y: 0,
            width: constants.map.width,
            height: constants.map.height,
        });

        this.lastTick = Date.now();


    }

    removePlayer(playerId: number) {
        this.players.removeById(playerId);
        this.ws.removeClient(playerId);
        this.sendRemoveEntity(playerId);
    }

    sendRemoveEntity(id: number) {
        // tell other clients to delete this entity
        this.players.array.forEach(player => {
            if (player.lastSeenEntities.has(id)) {
                player.lastSeenEntities.delete(id);
                SPacketWriter.REMOVE_PLAYER(player.streamWriter, id);
            }
        })
    }

    refreshQuadTree() {
        this.quadTree.clear();
        this.players.array.forEach((player: any) => {
            this.quadTree.insert(player.getQuadTreeFormat());
        });
        this.coins.forEach((coin: any) => {
            this.quadTree.insert(coin.getQuadTreeFormat());
        });
    }

    addPlayer(player: Player, ws: any) {
        player.roomId = this.id;
        player.id = ws.id;
        player.wsRoom = this.ws;

        this.players.add(player);
        this.ws.addClient(ws);

        // tell the player to spawn
        SPacketWriter.CLIENT_SPAWN(player.streamWriter, player.id, player.pos.x, player.pos.y, player.angle, player.healthPercent, player.skin, player.name, player.verified);

        for (let i = 0; i < this.players.array.length; i++) {
            const otherPlayer = this.players.array[i] as Player;

            // tell us about the other players names and id
            SPacketWriter.ADD_PLAYER(player.streamWriter, otherPlayer.id, otherPlayer.name);

            if (otherPlayer === player) continue;

            // now tell the other players about us
            SPacketWriter.ADD_PLAYER(otherPlayer.streamWriter, player.id, player.name);

        }

        // Send a packet to the client to tell them they joined the room, along with their position and id
        // writePlayerJoinPacket(player.streamWriter, ws.id, player.pos.x, player.pos.y);
        // Tell every singly player in the server about our info
        // const candidates = this.quadTree.retrieve(player.getRangeBounds());
        // candidates.forEach((candidate: any) => {
        //     if (candidate.id !== player.id) {
        //         const candidatePlayer = this.players.get(candidate.id);
        //         if (candidatePlayer && player.isInRangeWith(candidatePlayer)) {
        //             const data = candidatePlayer.getFirstSendData();
        //             writePlayerJoinServerPacket(player.streamWriter, data.id, data.name);
        //             player.lastSeenPlayers.add(candidate.id);
        //         }
        //     }
        // });
        // isBinary?: true
        // ws.send(player.streamWriter.bytes(), true);
        // player.streamWriter.reset();
    }

    removeCoin(coinId: any) {
        this.coins.delete(coinId);
        idGen.removeID(coinId)
        console.log('collected coin!');
    }

    getPlayer(playerId: any) {
        return this.players.get(playerId);
    }

    getCoin(coinId: any) {
        return this.coins.get(coinId);
    }

    tick() {
        const now = Date.now();
        const delta = now - this.lastTick;
        this.lastTick = now;
        this.refreshQuadTree();


        for (let i = 0; i < this.maxCoins - this.coins.size; i++) {
            const id = idGen.getID();
            this.coins.set(id, new Coin(id));
        }

        // Iterate over all players in map
        this.players.array.forEach((player: Player) => {
            player.moveUpdate(delta);
        });

        this.players.array.forEach((player: Player) => {
            player.packets(this);
        });
        this.players.array.forEach((player: Player) => {
            player.flushStream();
        });

        // eslint-disable-next-line no-param-reassign
        this.players.array.forEach((player: Player) => {
            if (player) {
                player.resetUpdated();
            }
        });
    }
}
