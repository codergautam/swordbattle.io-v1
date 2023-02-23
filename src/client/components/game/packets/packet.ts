import { StreamWriter } from '../../../../shared/lib/BitStream';
import Packet from '../../../../shared/Packet';

export function createPlayerMovePacket(stream: StreamWriter, angle: number, force: number, dirction: number, mouseDown: boolean) {
    stream.writeU8(Packet.Type.PLAYER_MOVE);
    stream.writeF32(angle);
    stream.writeU8(force);
    stream.writeU8(dirction);
    stream.writeU8(+mouseDown);
}

export function createJoinPacket(stream: StreamWriter, name: string, verify: boolean) {
    console.log('createJoinPacket', name, verify);
    stream.writeU8(Packet.Type.JOIN);
    stream.writeString(name);
    stream.writeU8(+verify);
}
