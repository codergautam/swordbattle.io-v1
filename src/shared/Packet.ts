import { Buffer } from 'buffer';
import { StreamReader } from './lib/BitStream';

let C = 0;
const SERVER_HEADERS = {
    // update player data
    UPDATE_PLAYER: C++,
    // When a player joins the server, send id and nametag
    ADD_PLAYER: C++,
    PLAYER_HEALTH: C++,
    // When a player comes to view
    CREATE_PLAYER: C++,
    LEADERBOARD: C++,
    ERROR: C++,
    REMOVE_PLAYER: C++,
    // player swings sword
    PLAYER_SWING: C++,
    // send client data about themselves (their x y id) only sent to the client who spawned
    CLIENT_SPAWN: C++,
    // only sent to the client who died
    CLIENT_DIED: C++,
    COIN: C++,
    COIN_COLLECT: C++,
    REMOVE_COIN: C++,
    CREATE_COIN: C++,
    COIN_COUNT: C++,
    KILL_COUNT: C++,
    CREATE_CHEST: C++,
    REMOVE_CHEST: C++,
    CHEST_HEALTH: C++,
    PLAYER_LEVEL: C++,

    EVOLVE_CHOOSE: C++,
    PLAYER_EVOLUTION: C++,
}
C = 0;
const CLIENT_HEADERS = {
    CONTROLS: C++,
    SPAWN: C++,
    EVOLVE_CHOSEN: C++,
}
// can refactor this above^ in later
export default class Packet {
    // sent from the server to the client
    static get ServerHeaders() {
        return SERVER_HEADERS;
    }
    // sent from the client to the server
    static get ClientHeaders() {
        return CLIENT_HEADERS;
    }
}
