import { RecognizedString } from 'uWebSockets.js';
import { ISwordsWebSocket } from '../ws';
import { RoomID } from './Room';

export default class WsRoom {
  id: RoomID; // Might want to put RoomID into a shared definitions file
  clients: Map<ISwordsWebSocket['id'], ISwordsWebSocket>;

  constructor(id: RoomID) {
    this.id = id;
    this.clients = new Map();
  }

  addClient(client: ISwordsWebSocket) {
    this.clients.set(client.id, client);
  }

  removeClient(clientId: ISwordsWebSocket['id']) {
    this.clients.delete(clientId);
  }

  getClient(clientId: ISwordsWebSocket['id']) {
    return this.clients.get(clientId);
  }

  send(message: RecognizedString, clientId: ISwordsWebSocket['id']) {
    const client = this.clients.get(clientId);
    if (client) {
      client.send(message);
    }
  }

  sendAll(message: RecognizedString) {
    // Map to array
    const clients = [...this.clients.values()];
    // eslint-disable-next-line no-restricted-syntax
    for (const client of clients) {
      client.send(message);
    }
  }

  sendExcept(message: RecognizedString, clientId: ISwordsWebSocket['id']) {
    const clients = [...this.clients.values()];
    // eslint-disable-next-line no-restricted-syntax
    for (const client of clients) {
      if (client.id !== clientId) {
        client.send(message);
      }
    }
  }
}
