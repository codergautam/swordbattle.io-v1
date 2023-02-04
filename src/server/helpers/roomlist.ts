class RoomList {
  rooms: any;

  constructor() {
    this.rooms = {};
  }

  getAllRooms() {
    return Object.values(this.rooms);
  }

  getRoom(id: any) {
    return this.rooms[id];
  }

  updateRoom(id: any, room: any) {
    this.rooms[id] = room;
  }

  addRoom(room: any) {
    this.rooms[room.id] = room;
  }

  removeRoom(id: any) {
    delete this.rooms[id];
  }
}

const list = new RoomList();

export default list;
