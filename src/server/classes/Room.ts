import QuadTree from '@timohausmann/quadtree-js';
import Packet from '../../shared/Packet';
import constants from '../helpers/constants';
import idGen from '../helpers/idgen';
import Player from './Player';
import WsRoom from './WsRoom';
import Coin from './Coin';
import ObjectManager from '../../shared/lib/ObjectManager';
import { writePlayerAddPacket, writePlayerCoinPacket, writePlayerJoinPacket } from '../packets/packet';

function addMissingCoins(room: Room) {
    for (let i = 0; i < room.maxCoins - room.coins.size; i++) {
        let coin = new Coin(String(i));
        room.coins.set(String(i), coin);

        // Find players in range of coin
        const candidates = room.quadTree.retrieve(coin.getRangeBounds());
        candidates.forEach((candidate: any) => {
                const candidatePlayer = room.players.get(candidate.id);
                if (candidatePlayer && coin.isInRangeWith(candidatePlayer)) {
                    // how do I send this to the client?
                    // writePlayerCoinPacket(candidatePlayer.streamWriter, coin.id, coin.pos.x, coin.pos.y, coin.radius);
                }
        });
    }
}

export default class Room {
    id: string | number;
    ws: any;
    // players: Map<any, Player>;
    players: ObjectManager<Player>;
    maxPlayers: any;
    coins: Map<any, Coin>;
    maxCoins: number;
    quadTree: QuadTree;
    lastTick: any;

    constructor(id = idGen() as string | number) {
        // eslint-disable-next-line no-param-reassign
        if (typeof id !== 'string' && typeof id !== 'number') id = idGen();
        this.id = id;
        this.ws = new WsRoom(this.id);
        this.players = new ObjectManager();
        this.maxPlayers = 4;
        this.coins = new Map();
        this.maxCoins = constants.max_coins;

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

        addMissingCoins(this);

    }

    removePlayer(playerId: number) {
        this.players.removeById(playerId);
        this.ws.removeClient(playerId);
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
        const ourPlayer = player;
        ourPlayer.roomId = this.id;
        ourPlayer.id = ws.id;
        ourPlayer.wsRoom = this.ws;

        this.players.add(ourPlayer);
        this.ws.addClient(ws);
        // Send a packet to the client to tell them they joined the room, along with position
        // ws.send(new Packet(Packet.Type.JOIN, [ws.id, ourPlayer.pos.x, ourPlayer.pos.y]).toBinary(true));
        writePlayerJoinPacket(ourPlayer.streamWriter, ws.id, ourPlayer.pos.x, ourPlayer.pos.y, ourPlayer.skin, ourPlayer.name, ourPlayer.verified);
        // Find all other players nearby and send them to the client
        const candidates = this.quadTree.retrieve(ourPlayer.getRangeBounds());
        candidates.forEach((candidate: any) => {
            if (candidate.id !== ourPlayer.id) {
                const candidatePlayer = this.players.get(candidate.id);
                if (candidatePlayer && ourPlayer.isInRangeWith(candidatePlayer)) {
                    // ws.send(new Packet(Packet.Type.PLAYER_ADD, candidatePlayer.getFirstSendData()).toBinary(true));
                    const data = candidatePlayer.getFirstSendData();
                    writePlayerAddPacket(player.streamWriter, data.id, data.x, data.y, data.angle, data.name, data.scale, data.health, data.evolution, data.swinging, data.swordThrown);
                    ourPlayer.lastSeenPlayers.add(candidate.id);
                }
            }
        });
        // isBinary?: true
        ws.send(ourPlayer.streamWriter.bytes(), true);
        ourPlayer.streamWriter.reset();
    }

    removeCoin(coinId: any) {
        this.coins.delete(coinId);
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

        // TODO: add coins
        addMissingCoins(this);

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
