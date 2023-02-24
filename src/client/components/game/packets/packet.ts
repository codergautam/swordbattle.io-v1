import { StreamWriter } from '../../../../shared/lib/BitStream';
import Packet from '../../../../shared/Packet';

// c for client
export const CPacketWriter = {
    CONTROLS: function(stream: StreamWriter, angle: number, force: number, direction: number, mouseDown: boolean) {
        stream.writeU8(Packet.ClientHeaders.CONTROLS);
        stream.writeF32(angle);
        stream.writeU8(force);
        stream.writeU8(direction);
        stream.writeU8(+mouseDown);
    },
    SPAWN: function(stream: StreamWriter, name: string, verify: boolean) {
        stream.writeU8(Packet.ClientHeaders.SPAWN);
        stream.writeString(name);
        stream.writeU8(+verify);
    }
}