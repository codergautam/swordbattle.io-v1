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
import Chest from './Chest';
import AiPlayer from './AiPlayer';

export default class Room {
    id: string | number;
    ws: any;
    // players: Map<any, Player>;
    players: ObjectManager<Player>;
    maxPlayers: any;
    coins: Map<number, Coin>;
    chests: Map<number, Chest>;
    maxCoins: number;
    quadTree: QuadTree;
    lastTick: any;
    lastLeaderboardUpdate: any;
    maxChests: any;

    constructor(id: string) {
        // eslint-disable-next-line no-param-reassign
        // if (typeof id !== 'string' && typeof id !== 'number') id = idGen();
        this.id = id;
        this.ws = new WsRoom(this.id);
        this.players = new ObjectManager();
        this.maxPlayers = 4;
        this.coins = new Map();
        this.chests = new Map();
        this.maxCoins = constants.max_coins;
        this.maxChests = constants.max_chests;
        this.lastLeaderboardUpdate = 0;

        for (let i = 0; i < this.maxCoins; i++) {
            const id = idGen.getID();
            this.coins.set(id, new Coin(id));
        }

        for (let i = 0; i < this.maxChests; i++) {
            const id = idGen.getID();
            this.chests.set(id, new Chest(id));
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
        this.chests.forEach((chest: any) => {
            this.quadTree.insert(chest.getQuadTreeFormat());
        });
    }

    addPlayer(player: Player, ws: any) {
        player.roomId = this.id;
        if(ws) player.id = ws.id;
        player.wsRoom = this.ws;

        this.players.add(player);
        if(ws) this.ws.addClient(ws);

        // tell the player to spawn
        if(!player.ai) SPacketWriter.CLIENT_SPAWN(player.streamWriter, player.id, player.pos.x, player.pos.y, player.angle, player.healthPercent, player.skin, player.name, player.verified);

        for (let i = 0; i < this.players.array.length; i++) {
            const otherPlayer = this.players.array[i] as Player;

            // tell us about the other players names and id
            if(!player.ai) SPacketWriter.ADD_PLAYER(player.streamWriter, otherPlayer.id, otherPlayer.name, otherPlayer.verified);

            if (otherPlayer === player) continue;

            // now tell the other players about us
            SPacketWriter.ADD_PLAYER(otherPlayer.streamWriter, player.id, player.name, player.verified);

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
    }

    removeChest(chestId: any) {
        this.chests.delete(chestId);
        idGen.removeID(chestId)
        console.log('collected chest!');
    }

    getPlayer(playerId: any) {
        return this.players.get(playerId);
    }

    getCoin(coinId: any) {
        return this.coins.get(coinId);
    }

    getChest(chestId: any) {
        return this.chests.get(chestId);
    }

    addCoins(drop: Coin[]) {
        drop.forEach((coin: Coin) => {
            this.coins.set(coin.id, coin);
        });
    }

    tick() {
        const now = Date.now();
        const delta = now - this.lastTick;
        this.lastTick = now;
        this.refreshQuadTree();


        for(let i = this.players.array.filter((p)=>p.ai).length; i < constants.max_ai; i++) {
            const id = idGen.getID();
            const ai = new AiPlayer(id, "Im an ai");
            this.addPlayer(ai, undefined);
        }
        for (let i = 0; i < this.maxCoins - this.coins.size; i++) {
            const id = idGen.getID();
            this.coins.set(id, new Coin(id));
        }
        for (let i = 0; i < this.maxChests - this.chests.size; i++) {
            const id = idGen.getID();
            this.chests.set(id, new Chest(id));
        }

        // Iterate over all players in map
        this.players.array.forEach((player: Player) => {
            player.moveUpdate(delta);
        });

        this.players.array.forEach((player: Player) => {
            if(player.ai) {
                (player as AiPlayer).tick(this);
            } else {
            player.packets(this);
            }
        });
        this.players.array.forEach((player: Player) => {
            player.flushStream();
        });
        for(let chest of Array.from(this.chests.values())) {
            if(Date.now() - chest.lastSent > 5000) {
                chest.lastSent = Date.now();
                this.chests.set(chest.id, chest);
            }
        }

        if(this.lastLeaderboardUpdate + 1000 < now) {
            this.lastLeaderboardUpdate = now;
                let playerArr = this.players.array.map((p: Player) => {
                    return {
                        id: p.id,
                        name: p.name,
                        coins: p.coins,
                        scale: p.scale,
                        verified: p.verified,
                        x: p.pos.x,
                        y: p.pos.y,
                    }
                }).sort((a: any, b: any) => {
                    // Sort by coins
                    return b.coins - a.coins;
                });
                this.players.array.forEach((player: Player) => {
                    if(!player.ai) SPacketWriter.LEADERBOARD(player.streamWriter, playerArr);
                });


        }

        // eslint-disable-next-line no-param-reassign
        this.players.array.forEach((player: Player) => {
            if (player) {
                player.resetUpdated();
            }
        });
    }
}
