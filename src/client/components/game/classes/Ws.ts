import Phaser from 'phaser';
import Packet from '../../../../shared/Packet';
import { StreamReader, StreamWriter } from '../../../../shared/lib/BitStream';
import initWebsocket from '../helpers/initWebsocket';

export default class Ws extends Phaser.Events.EventEmitter {
    serverUrl: string;
    ws: WebSocket;
    connected: boolean;
    id: any;
    streamReader: StreamReader;
    streamWriter: StreamWriter;
    constructor(serverUrl: string) {
        super();
        this.serverUrl = serverUrl;
        this.connected = false;
        this.streamReader = new StreamReader();
        this.streamWriter = new StreamWriter();

        initWebsocket(this.serverUrl, null, 5000, 2)
            .then((ws: any) => {
                this.ws = ws;
                this.ws.binaryType = 'arraybuffer';
                this.connected = true;
                this.emit('connected');

                this.ws.onmessage = (event: any) => {
                    try {
                        const { data } = event;
                        switch (typeof data) {
                            case 'string':
                                // parse JSON
                                // this.parseJSON(JSON.parse(data));
                                break;
                            case 'object':
                                // parse binary
                                this.parseBinary(data);
                                break;
                        }
                    } catch (e) {
                        console.error('error while parsing packet', e);
                    }
                };

                this.ws.onerror = () => {
                    const err = 'There was an error in your connection to the server.';
                    this.emit('connectionLost', err);
                };
                this.ws.onclose = () => {
                    const err = 'The connection to the server was closed unexpectedly.';
                    this.emit('connectionLost', err);
                };
            })
            .catch((err: string) => {
                console.error(err);
                this.emit('connect_error', err);
            });
    }
    // send(packet: Packet, json = false) {
    send(packet: string | ArrayBuffer, json = false) {
        if (this.connected) {
            // check if closing or closed
            if (this.ws.readyState === 2 || this.ws.readyState === 3) {
                this.emit('connectionLost', 'The connection to the server was closed unexpectedly.');
                console.error('The connection to the server was closed unexpectedly.');
                return;
            }
            this.ws.send(packet);
        }
    }
    flushStream(): boolean {
        if (this.streamWriter.size() > 0) {
            this.send(this.streamWriter.bytes());
            this.streamWriter.reset();
            return true;
        }
        return false;
    }
    parseJSON(json) {}
    parseBinary(buffer: ArrayBuffer) {
        const arrivalTime = Date.now();
        this.streamReader.readFrom(buffer);
        while (this.streamReader.hasMoreData()) {
            const packetType = this.streamReader.readU8();
            switch (packetType) {
                case Packet.ServerHeaders.CLIENT_SPAWN:
                    this.spawnData(packetType);
                break;
                case Packet.ServerHeaders.CREATE_PLAYER:
                    this.createPlayer(packetType, arrivalTime);
                break;
                case Packet.ServerHeaders.UPDATE_PLAYER:
                    this.updatePlayer(packetType, arrivalTime)
                break;
                case Packet.ServerHeaders.PLAYER_HEALTH:
                    this.health(packetType);
                    break;
                case Packet.ServerHeaders.PLAYER_SWING:
                    this.swing(packetType);
                    break;
                case Packet.ServerHeaders.PLAYER_LEVEL:
                    this.playerLevel(packetType);
                    break;
                case Packet.ServerHeaders.ADD_PLAYER:
                    this.playerJoinedServer(packetType);
                    break;
                case Packet.ServerHeaders.REMOVE_PLAYER:
                    this.removePlayer(packetType);
                    break;
                case Packet.ServerHeaders.CLIENT_DIED:
                    this.die(packetType);
                    break;
                case Packet.ServerHeaders.CREATE_COIN:
                    this.createCoin(packetType);
                    break;
                case Packet.ServerHeaders.REMOVE_COIN:
                    this.removeCoin(packetType);
                    break;
                case Packet.ServerHeaders.LEADERBOARD:
                    this.leaderboard(packetType);
                    break;
                case Packet.ServerHeaders.COIN_COUNT:
                    this.coinCount(packetType);
                    break;
                case Packet.ServerHeaders.KILL_COUNT:
                    this.killCount(packetType);
                    break;
                case Packet.ServerHeaders.CHEST_HEALTH:
                    this.chestHealth(packetType);
                    break;
                case Packet.ServerHeaders.CREATE_CHEST:
                    this.createChest(packetType);
                    break;
                case Packet.ServerHeaders.REMOVE_CHEST:
                    this.removeChest(packetType);
                    break;
                default:
                    throw new Error("Unknown packet type received on client: " + packetType)
            }
        }
    }
    spawnData(packetType: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        const rotation = this.streamReader.readF32();
        const health = this.streamReader.readU8();
        const skin = this.streamReader.readString();
        const name = this.streamReader.readString();
        const loggedIn = this.streamReader.readU8();
        this.emit(packetType.toString(), [id, x, y, rotation, health, skin, name, loggedIn]);
    }
    createPlayer(packetType: number, time: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        const rotation = this.streamReader.readF32();
        const health = this.streamReader.readU8();
        const level = this.streamReader.readF32();
        const skin = this.streamReader.readString();

        this.emit(packetType.toString(), [id, x, y, rotation, health, time, level, skin]);
    }
    updatePlayer(packetType: number, arrivalTime: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        const rotation = this.streamReader.readF32();

        this.emit(packetType.toString(), { id, pos: { x, y }, rotation, time: arrivalTime });

    }
    health(packetType: number) {
        const id = this.streamReader.readULEB128();
        const health = this.streamReader.readU8();
        console.log("health", id, health)
        this.emit(packetType.toString(), { id, health });
    }
    swing(packetType: number) {
        const id = this.streamReader.readULEB128();
        // cast 0 or 1 to boolean
        const isSwinging = !!this.streamReader.readU8();
        console.log("swing", id, isSwinging)
        this.emit(packetType.toString(), { id, s: isSwinging });
    }
    playerJoinedServer(packetType: number) {
        const id = this.streamReader.readULEB128();
        const loggedIn = this.streamReader.readU8();
        const name = this.streamReader.readString();
        // const x = this.streamReader.readF32();
        // const y = this.streamReader.readF32();
        // const angle = this.streamReader.readF32();
        // const name = this.streamReader.readString();
        // const health = this.streamReader.readU8();
        // const evolution = this.streamReader.readU8();
        // const scale = this.streamReader.readF32();

        // const bitflag = this.streamReader.readU8();
        // checks the first two bits on this byte
        // eg: (if both are set) 1 1 0 0 0 0 0
        // const swinging = bitflag & 1;
        // const swordThrown = bitflag & 2;
        this.emit(packetType.toString(), {
            id,
            name,
            loggedIn,
            // x,
            // y,
            // scale,
            // angle,
            // health,
            // okay looks like the client doesn't even need evolution and the bitflag
            // oh well, its a good example for how you can do this in the future
        });
    }
    coinCount(packetType: number) {
        const count = this.streamReader.readULEB128();
        this.emit(packetType.toString(), { count });
    }
    killCount(packetType: number) {
        const count = this.streamReader.readULEB128();
        this.emit(packetType.toString(), { count });
    }
    removePlayer(packetType: number) {
        const id = this.streamReader.readULEB128();

        this.emit(packetType.toString(), { id });
    }
    die(packetType: number) {
        const kills = this.streamReader.readULEB128();
        const killer = this.streamReader.readString();

        this.emit(packetType.toString(), kills, killer);
    }
    createCoin(packetType: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        const value = this.streamReader.readU8();
        this.emit(packetType.toString(), { id, x, y, value })
    }
    removeCoin(packetType: number) {
        const id = this.streamReader.readULEB128();
        const collector = this.streamReader.readULEB128();
        this.emit(packetType.toString(), { id, collector })
    }
    leaderboard(packetType: number) {
        const leaderboardLength = this.streamReader.readULEB128();
        const leaderboard: {id: number, name: string, coins: number, scale: number, verified: number, x: number, y: number}[] = [];
        for (let i = 0; i < leaderboardLength; i++) {
            const id = this.streamReader.readULEB128();
            const name = this.streamReader.readString();
            const coins = this.streamReader.readULEB128();
            const scale = this.streamReader.readF32();
            const verified = this.streamReader.readU8();
            const x = this.streamReader.readF32();
            const y = this.streamReader.readF32();
            leaderboard.push({ id, name, coins, scale, verified, x, y });
        }

        this.emit(packetType.toString(), leaderboard);
    }
    removeChest(packetType: number) {
        const id = this.streamReader.readULEB128();
        this.emit(packetType.toString(), { id })
    }
    createChest(packetType: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        const value = this.streamReader.readU8();
        const health = this.streamReader.readF32();
        const maxHealth = this.streamReader.readF32();
        this.emit(packetType.toString(), { id, x, y, value, health, maxHealth })
    }
    chestHealth(packetType: number) {
        const id = this.streamReader.readULEB128();
        const health = this.streamReader.readF32();
        this.emit(packetType.toString(), { id, health })
    }
    playerLevel(packetType: number) {
        const id = this.streamReader.readULEB128();
        const level = this.streamReader.readF32();
        this.emit(packetType.toString(), { id, level });
    }
}
