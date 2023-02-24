import { StreamWriter } from '../../shared/lib/BitStream';
import Packet from '../../shared/Packet';

export const SPacketWriter = {
    UPDATE_PLAYER: function(stream: StreamWriter, id: number, x: number, y: number, rotation: number) {
        stream.writeU8(Packet.ServerHeaders.UPDATE_PLAYER);
        stream.writeLEB128(id);
        stream.writeF32(x);
        stream.writeF32(y);
        stream.writeF32(rotation);    
    
    },
    ADD_PLAYER: function(stream: StreamWriter, id: number, name: string) {
        stream.writeU8(Packet.ServerHeaders.ADD_PLAYER);
        stream.writeLEB128(id);
        stream.writeString(name);
    },
    PLAYER_HEALTH: function(stream: StreamWriter, id: number, health: number) {
        stream.writeU8(Packet.ServerHeaders.PLAYER_HEALTH);
        stream.writeLEB128(id);
        stream.writeU8(health);
    },
    CREATE_PLAYER: function(stream: StreamWriter, id: number, x: number, y: number, rotation: number, health: number) {
        stream.writeU8(Packet.ServerHeaders.CREATE_PLAYER);
        stream.writeLEB128(id);
        stream.writeF32(x);
        stream.writeF32(y);
        stream.writeF32(rotation);
        stream.writeU8(health);
    },
    REMOVE_PLAYER: function(stream: StreamWriter, id: number) {
        stream.writeU8(Packet.ServerHeaders.REMOVE_PLAYER);
        stream.writeLEB128(id);
    },
    PLAYER_SWING: function(stream: StreamWriter, id: number, swing: boolean) {
        stream.writeU8(Packet.ServerHeaders.PLAYER_SWING);
        stream.writeLEB128(id);
        stream.writeU8(+swing);
    },
    CLIENT_DIED: function(stream: StreamWriter, kills: number, killer: string) {
        stream.writeU8(Packet.ServerHeaders.CLIENT_DIED);
        stream.writeLEB128(kills);
        stream.writeString(killer);
    },
    CLIENT_SPAWN: function(stream: StreamWriter, wsID: number, x: number, y: number, rotation: number, health: number, skin: string, name: string, verified: boolean) {
        stream.writeU8(Packet.ServerHeaders.CLIENT_SPAWN);
        stream.writeLEB128(wsID);
        stream.writeF32(x);
        stream.writeF32(y);
        stream.writeF32(rotation);
        stream.writeU8(health);
        stream.writeString(skin);
        stream.writeString(name);
        stream.writeU8(+verified);
    },
    REMOVE_COIN: function(stream: StreamWriter, id: number) {
        stream.writeU8(Packet.ServerHeaders.REMOVE_COIN);
        stream.writeLEB128(id);
    },
    CREATE_COIN: function(stream: StreamWriter, id: number, x: number, y: number) {
        stream.writeU8(Packet.ServerHeaders.CREATE_COIN);
        stream.writeLEB128(id);
        stream.writeF32(x);
        stream.writeF32(y);
    }
}