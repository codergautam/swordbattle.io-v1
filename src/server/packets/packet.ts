import { StreamWriter } from '../../shared/lib/BitStream';
import Packet from '../../shared/Packet';

export function writePlayerRotationPacket(stream: StreamWriter, id: number, rotation: number) {
    stream.writeU8(Packet.Type.PLAYER_ROTATE);
    stream.writeLEB128(id);
    stream.writeF32(rotation);
}

export function writePlayerSwingPacket(stream: StreamWriter, id: number, swing: boolean) {
    stream.writeU8(Packet.Type.PLAYER_SWING);
    stream.writeLEB128(id);
    stream.writeU8(+swing);
}

export function writePlayerPositionPacket(stream: StreamWriter, id: number, x: number, y: number) {
    stream.writeU8(Packet.Type.PLAYER_MOVE);
    stream.writeLEB128(id);
    stream.writeF32(x);
    stream.writeF32(y);
}

export function writePlayerHealthPacket(stream: StreamWriter, id: number, health: number) {
    stream.writeU8(Packet.Type.PLAYER_HEALTH);
    stream.writeLEB128(id);
    stream.writeU8(health);
}
/**
 In the future, we should separate playerAdd and playerJoin
 playerJoin will be sent to all players ONLY when they join the game (don't worry if they are in view range or not)
 it will contain the players id and name

 playerAdd will be sent when a player comes in range of another player
 it will contain player state data including their id (but not their name)

 this way, we won't have to send the player's name each time add player is called
 */
export function writePlayerAddPacket(stream: StreamWriter, id: number, x: number, y: number, angle: number, name: string, scale: number, health: number, evolution: number, swinging: boolean, swordThrown: boolean) {
    // old packet
    // {"t":2,"d":{"name":"mini","x":71.25,"y":37.5,"angle":0,"scale":0.25,"evolution":0,"swinging":false,"swordThrown":false,"id":3,"health":100}}
    stream.writeU8(Packet.Type.PLAYER_ADD);
    stream.writeLEB128(id);
    stream.writeF32(x);
    stream.writeF32(y);
    stream.writeF32(angle);
    stream.writeString(name);
    stream.writeU8(health);
    stream.writeU8(evolution);
    stream.writeF32(scale);
    // we can pack up to 8 boolean values into a single byte (8 bits)
    let bitflag = 0;
    if (swinging) bitflag |= 1;
    if (swordThrown) bitflag |= 2;
    // you can keep adding more flags, don't touch the number on the right
    // if (bool) bitflag |= 4;
    // if (bool) bitflag |= 8;
    // if (bool) bitflag |= 16;
    // if (bool) bitflag |= 32;
    // if (bool) bitflag |= 64;
    // if (bool) bitflag |= 128;
    stream.writeU8(bitflag);
}

export function writePlayerRemovePacket(stream: StreamWriter, id: number) {
    stream.writeU8(Packet.Type.PLAYER_REMOVE);
    stream.writeLEB128(id);
}

export function writePlayerJoinPacket(stream: StreamWriter, wsID: number, x: number, y: number) {
    stream.writeU8(Packet.Type.JOIN);
    stream.writeLEB128(wsID);
    stream.writeF32(x);
    stream.writeF32(y);
}

export function writePlayerDiePacket(stream: StreamWriter, kills: number, killer: string) {
    stream.writeU8(Packet.Type.DIE);
    // we cannot predict the range of kills so we use little endian
    //(u16 would probably be fine) but max is 35k
    stream.writeLEB128(kills);
    stream.writeString(killer);
}

export function writePlayerCoinPacket(stream: StreamWriter, id: string, x: number, y: number, radius: number) {
    stream.writeU8(Packet.Type.COIN);
    stream.writeString(id);
    stream.writeF32(x);
    stream.writeF32(y);
    stream.writeF32(radius);
}