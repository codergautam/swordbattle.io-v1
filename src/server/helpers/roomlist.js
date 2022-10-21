class RoomList {
  constructor() {
    this.rooms = {};
  }

  getAllRooms() {
    return Object.values(this.rooms);
  }

  getRoom(id) {
    return this.rooms[id];
  }

  updateRoom(id, room) {
    this.rooms[id] = room;
  }

  addRoom(room) {
    this.rooms[room.id] = room;
  }

  removeRoom(id) {
    delete this.rooms[id];
  }
}

const list = new RoomList();

module.exports = list;
