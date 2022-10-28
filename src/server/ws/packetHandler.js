/* eslint-disable no-param-reassign */
const roomList = require('../helpers/roomlist');
const Packet = require('../../shared/Packet');
const Player = require('../classes/Player');
const unjoinedRoom = require('../helpers/unjoinedRoom');

const mainRoom = roomList.getRoom('main');

module.exports = (ws, packet) => {
  switch (packet.type) {
    case Packet.Type.JOIN:
      // Verify that all data sent is valid
      const { data } = packet;

      // Join the player into main room
      let player = new Player(data.name);
      ws.joinedAt = Date.now();
      unjoinedRoom.removeClient(ws.id);
      mainRoom.addPlayer(player, ws);
      break;
    default:
      break;
  }
};
