import Room, { RoomID } from '../classes/Room';

interface IRoomList {
  [id: string]: Room
}

class RoomList {
  private rooms: IRoomList;

  constructor() {
    this.rooms = {};
  }

  getAllRooms() {
    return Object.values(this.rooms);
  }

  getRoom(id: RoomID) {
    return this.rooms[id];
  }

  updateRoom(id: RoomID, room: Room) {
    this.rooms[id] = room;
  }

  addRoom(room: Room) {
    this.rooms[room.id] = room;
  }

  removeRoom(id: RoomID) {
    delete this.rooms[id];
  }
}

const list = new RoomList();

export default list;
