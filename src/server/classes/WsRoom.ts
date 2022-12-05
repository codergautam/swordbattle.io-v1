import { RoomID } from './Room';

export default class WsRoom {
  id: RoomID; // Might want to put RoomID into a shared definitions file
  clients: any;

  constructor(id: any) {
    this.id = id;
    this.clients = new Map();
  }

  addClient(client: any) {
    this.clients.set(client.id, client);
  }

  removeClient(clientId: any) {
    this.clients.delete(clientId);
  }

  getClient(clientId: any) {
    return this.clients.get(clientId);
  }

  send(message: any, clientId: any) {
    const client = this.clients.get(clientId);
    if (client) {
      client.send(message);
    }
  }

  sendAll(message: any) {
    // Map to array
    const clients = [...this.clients.values()];
    // eslint-disable-next-line no-restricted-syntax
    for (const client of clients) {
      client.send(message);
    }
  }

  sendExcept(message: any, clientId: any) {
    const clients = [...this.clients.values()];
    // eslint-disable-next-line no-restricted-syntax
    for (const client of clients) {
      if (client.id !== clientId) {
        client.send(message);
      }
    }
  }
}
