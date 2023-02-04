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
                        // const parsed = Packet.fromBinary(event.data);
                        // this.emit(parsed.type, parsed.data);
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
            // this.ws.send(packet.toBinary(json));
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
        this.streamReader.readFrom(buffer);
        while (this.streamReader.hasMoreData()) {
            const packetType = this.streamReader.readU8();
            switch (packetType) {
                case Packet.Type.JOIN:
                    this.join(packetType);
                    break;
                case Packet.Type.PLAYER_MOVE:
                    this.move(packetType);
                    break;
                case Packet.Type.PLAYER_ROTATE:
                    this.rotate(packetType);
                    break;
                case Packet.Type.PLAYER_HEALTH:
                    this.health(packetType);
                    break;
                case Packet.Type.PLAYER_SWING:
                    this.swing(packetType);
                    break;
                case Packet.Type.PLAYER_ADD:
                    this.addPlayer(packetType);
                    break;
                case Packet.Type.PLAYER_REMOVE:
                    this.removePlayer(packetType);
                    break;
                case Packet.Type.DIE:
                    this.die(packetType);
                    break;
            }
        }
    }
    join(packetType: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        this.emit(packetType.toString(), [id, x, y]);
    }
    move(packetType: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        this.emit(packetType.toString(), { id, pos: { x, y } });
    }
    rotate(packetType: number) {
        const id = this.streamReader.readULEB128();
        const rotation = this.streamReader.readF32();
        this.emit(packetType.toString(), { id, r: rotation });
    }
    health(packetType: number) {
        const id = this.streamReader.readULEB128();
        const health = this.streamReader.readU8();
        this.emit(packetType.toString(), { id, health });
    }
    swing(packetType: number) {
        const id = this.streamReader.readULEB128();
        // cast 0 or 1 to boolean
        const isSwinging = !!this.streamReader.readU8();
        this.emit(packetType.toString(), { id, s: isSwinging });
    }
    addPlayer(packetType: number) {
        const id = this.streamReader.readULEB128();
        const x = this.streamReader.readF32();
        const y = this.streamReader.readF32();
        const angle = this.streamReader.readF32();
        const name = this.streamReader.readString();
        const health = this.streamReader.readU8();
        const evolution = this.streamReader.readU8();
        const scale = this.streamReader.readF32();

        const bitflag = this.streamReader.readU8();
        // checks the first two bits on this byte
        // eg: (if both are set) 1 1 0 0 0 0 0
        const swinging = bitflag & 1;
        const swordThrown = bitflag & 2;
        this.emit(packetType.toString(), {
            id,
            name,
            x,
            y,
            scale,
            angle,
            health,
            // okay looks like the client doesn't even need evolution and the bitflag
            // oh well, its a good example for how you can do this in the future
        });
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
}
