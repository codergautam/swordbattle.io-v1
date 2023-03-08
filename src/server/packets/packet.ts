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
    ADD_PLAYER: function(stream: StreamWriter, id: number, name: string, verified: boolean) {
        stream.writeU8(Packet.ServerHeaders.ADD_PLAYER);
        stream.writeLEB128(id);
        stream.writeU8(+verified);
        stream.writeString(name);
    },
    PLAYER_HEALTH: function(stream: StreamWriter, id: number, health: number) {
        stream.writeU8(Packet.ServerHeaders.PLAYER_HEALTH);
        stream.writeLEB128(id);
        stream.writeU8(health);
    },
    CREATE_PLAYER: function(stream: StreamWriter, id: number, x: number, y: number, rotation: number, health: number, level: number, skin: string) {
        stream.writeU8(Packet.ServerHeaders.CREATE_PLAYER);
        stream.writeLEB128(id);
        stream.writeF32(x);
        stream.writeF32(y);
        stream.writeF32(rotation);
        stream.writeU8(health);
        stream.writeF32(level);
        stream.writeString(skin);
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
    REMOVE_COIN: function(stream: StreamWriter, id: number, collector: number = 0) {
        stream.writeU8(Packet.ServerHeaders.REMOVE_COIN);
        stream.writeLEB128(id);
        stream.writeLEB128(collector);
    },
    CREATE_COIN: function(stream: StreamWriter, id: number, x: number, y: number, value: number) {
        stream.writeU8(Packet.ServerHeaders.CREATE_COIN);
        stream.writeLEB128(id);
        stream.writeF32(x);
        stream.writeF32(y);
        stream.writeU8(value);
    },
    COIN_COUNT: function(stream: StreamWriter, count: number) {
        stream.writeU8(Packet.ServerHeaders.COIN_COUNT);
        stream.writeLEB128(count);
    },
    KILL_COUNT: function(stream: StreamWriter, count: number) {
        stream.writeU8(Packet.ServerHeaders.KILL_COUNT);
        stream.writeLEB128(count);
    },
    LEADERBOARD: function(stream: StreamWriter, leaderboard: any) {
        stream.writeU8(Packet.ServerHeaders.LEADERBOARD);
        stream.writeLEB128(leaderboard.length);
        for (let i = 0; i < leaderboard.length; i++) {
            // id, name, coins, scale, verified, x, y
            stream.writeLEB128(leaderboard[i].id);
            stream.writeString(leaderboard[i].name);
            stream.writeLEB128(leaderboard[i].coins);
            stream.writeF32(leaderboard[i].scale);
            stream.writeU8(+leaderboard[i].verified);
            stream.writeF32(leaderboard[i].x);
            stream.writeF32(leaderboard[i].y);
        }
    },
    REMOVE_CHEST: function(stream: StreamWriter, id: number) {
        stream.writeU8(Packet.ServerHeaders.REMOVE_CHEST);
        stream.writeLEB128(id);
    },
    CREATE_CHEST: function(stream: StreamWriter, id: number, x: number, y: number, type: number, health: number, maxHealth: number) {
        stream.writeU8(Packet.ServerHeaders.CREATE_CHEST);
        stream.writeLEB128(id);
        stream.writeF32(x);
        stream.writeF32(y);
        stream.writeU8(type);
        stream.writeF32(health);
        stream.writeF32(maxHealth);
    },
    CHEST_HEALTH: function(stream: StreamWriter, id: number, health: number) {
        stream.writeU8(Packet.ServerHeaders.CHEST_HEALTH);
        stream.writeLEB128(id);
        stream.writeF32(health);
    },
    PLAYER_LEVEL: function(stream: StreamWriter, id: number, level: number) {
        stream.writeU8(Packet.ServerHeaders.PLAYER_LEVEL);
        stream.writeLEB128(id);
        stream.writeF32(level);
    },
    EVOLVE_CHOOSE: function(stream: StreamWriter, choices: number[]) {
        stream.writeU8(Packet.ServerHeaders.EVOLVE_CHOOSE);
        stream.writeLEB128(choices.length);
        for (let i = 0; i < choices.length; i++) {
            stream.writeU8(choices[i]);
        }
    }
}