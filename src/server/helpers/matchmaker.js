const config = require('../../../config.json');
const roomlist = require('./roomlist');
const Room = require('../classes/Room');
const until = require('./until');
const Player = require('../classes/Player');
const RoomState = require('../classes/RoomState');

module.exports = async (ws) => {
  console.log('Finding match for ', ws.id);
  await until(() => roomlist.getAllRooms().filter(room=>room.state != RoomState.WAITING).length <= config.maxRooms);
  const room = roomlist.getAllRooms().filter(room=>room.state == RoomState.WAITING).length > 0 ? roomlist.getAllRooms().filter(room=>room.state == RoomState.WAITING)[0] : new Room();

  room.addPlayer(new Player('gautam'), ws);

  roomlist.addRoom(room);
};
