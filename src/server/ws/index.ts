import packetHandler from './packetHandler';
import idgen from '../helpers/idgen';
import Packet from '../../shared/Packet';
import Room from '../classes/Room';
import PacketErrorTypes from '../../shared/PacketErrorTypes';
import roomList from '../helpers/roomlist';
import unjoinedRoom from '../helpers/unjoinedRoom';
import constants from '../helpers/constants';

const mainRoom = new Room('main');
(roomList as any).addRoom(mainRoom);

setInterval(() => {
    [...unjoinedRoom.clients.values()].forEach(client => {
        if (client.joinedAt + 10000 < Date.now()) {
            // im not sure when this is actually executed so i cant really test a bitstream change here
            // eslint-disable-next-line max-len
            client.send(new Packet(Packet.Type.ERROR, PacketErrorTypes.JOIN_TIMEOUT.code).toBinary());
            client.end();
        }
    });
}, 1000);

export default {
    idleTimeout: 32,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    /* other events (upgrade, open, ping, pong, close) */
    open: (ws: any) => {
        // eslint-disable-next-line no-param-reassign
        ws.id = idgen();
        // eslint-disable-next-line no-param-reassign
        ws.joinedAt = Date.now();
        console.log(`Client ${ws.id} connected`);
        unjoinedRoom.addClient(ws);
    },
    close: (ws: any) => {
        console.log(`Client ${ws.id} disconnected`);
        if (unjoinedRoom.clients.has(ws.id)) {
            unjoinedRoom.removeClient(ws.id);
        } else if (mainRoom.ws.clients.has(ws.id)) {
            mainRoom.removePlayer(ws.id);
        }
    },
    message: (ws: any, m: any) => {
        // const packet = Packet.fromBinary(m);

        packetHandler(ws, m);

        // packetHandler(ws, packet);
    },
};

setInterval(() => {
    mainRoom.tick();
}, 1000 / constants.expected_tps);
