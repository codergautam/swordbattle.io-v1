/* eslint-disable no-param-reassign */
import roomList from '../helpers/roomlist';
import Packet from '../../shared/Packet';
import Player from '../classes/Player';
import unjoinedRoom from '../helpers/unjoinedRoom';
import Room from '../classes/Room';
import { StreamReader } from '../../shared/lib/BitStream';

export const streamReader = new StreamReader();

export default (ws: any, buffer: ArrayBuffer) => {
    const mainRoom = (roomList as any).getRoom('main') as Room;
    streamReader.readFrom(buffer);
    while (streamReader.hasMoreData()) {
        const packetType = streamReader.readU8();
        switch (packetType) {
            case Packet.ClientHeaders.SPAWN:
                const name = streamReader.readString();
                const verify: boolean = !!streamReader.readU8();

                // TODO: Verify that all data sent is valid
                // Join the player into main room
                const player = new Player(name);
                ws.joinedAt = Date.now();
                unjoinedRoom.removeClient(ws.id);
                mainRoom.addPlayer(player, ws);
                break;

            case Packet.ClientHeaders.CONTROLS:
                const angle = streamReader.readF32();
                const force = streamReader.readU8();
                const direction = streamReader.readU8();
                const mouseDown: boolean = !!streamReader.readU8();

                const _player = mainRoom.getPlayer(ws.id);
                if (!_player) return;
                _player.setAngle(angle);
                _player.setMoveDir(direction);
                _player.setMouseDown(mouseDown);
                _player.setForce(force);
                break;

            default:
                // don't throw error here or people can crash game if they purposely send bad packets
                console.log('unknown packet type: ' + packetType);
                break;
        }
    }
    // switch (packet.type) {
    //     case Packet.Type.JOIN: {
    //         // TODO: Verify that all data sent is valid
    //         const { data } = packet;
    //         // Join the player into main room
    //         const player = new Player(data.name);
    //         ws.joinedAt = Date.now();
    //         unjoinedRoom.removeClient(ws.id);
    //         mainRoom.addPlayer(player, ws);
    //         break;
    //     }
    //     case Packet.Type.PLAYER_MOVE: {
    //         const { data } = packet;
    //         const player = mainRoom.getPlayer(ws.id);

    //         console.log(data);

    //         if (player) {
    //             if (data.d !== undefined) player.setAngle(data.d);
    //             if (data.m !== undefined) player.setMoveDir(data.m);
    //             if (data.f !== undefined) player.setForce(data.f);
    //             if (data.md !== undefined) player.setMouseDown(data.md);
    //         }
    //         break;
    //     }
    //     default:
    //         break;
    // }
};
