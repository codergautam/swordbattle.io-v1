/* eslint-disable no-param-reassign */
import roomList from '../helpers/roomlist';
import Packet from '../../shared/Packet';
import Player from '../classes/Player';
import unjoinedRoom from '../helpers/unjoinedRoom';
import Room from '../classes/Room';
import { StreamReader } from '../../shared/lib/BitStream';
import db from '../helpers/db';

export const streamReader = new StreamReader();

export default async (ws: any, buffer: ArrayBuffer) => {
    const mainRoom = (roomList as any).getRoom('main') as Room;
    streamReader.readFrom(buffer);
    while (streamReader.hasMoreData()) {
        const packetType = streamReader.readU8();
        switch (packetType) {
            case Packet.ClientHeaders.SPAWN:
                const name = streamReader.readString();
                const verify: boolean = !!streamReader.readU8();
                // TODO: Some way to send custom error messages to client
                let player;
                if(verify) {
                    // This means that the name is actually a secret for logging in
                    const user = await db.getUserFromSecret(name);
                    if(!user) {
                        ws.end();
                        return;
                    }

                    player = new Player(user.username);
                    player.verified = true;
                    // player.skin = user.skins.selected;

                } else {
                    player = new Player(name.substring(0,12));
                }
                ws.joinedAt = Date.now();
                unjoinedRoom.removeClient(ws.id);
                mainRoom.addPlayer(player as Player, ws);
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

            case Packet.ClientHeaders.EVOLVE_CHOSEN:
                const chosen = streamReader.readU8();
                const _player2 = mainRoom.getPlayer(ws.id);
                if (!_player2) return;
                _player2.setEvolveChosen(chosen);

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
