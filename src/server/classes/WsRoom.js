module.exports = class WsRoom {
  constructor(id) {
    this.id = id;
    this.clients = new Map();
  }

  addClient(client) {
    this.clients.set(client.id, client);
  }

  removeClient(clientId) {
    this.clients.delete(clientId);
  }

  send(message, clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.send(message);
    }
  }

  sendAll(message) {
    // Map to array
    const clients = [...this.clients.values()];
    // eslint-disable-next-line no-restricted-syntax
    for (const client of clients) {
      client.send(message);
    }
  }

  sendExcept(message, clientId) {
    const clients = [...this.clients.values()];
    // eslint-disable-next-line no-restricted-syntax
    for (const client of clients) {
      if (client.id !== clientId) {
        client.send(message);
      }
    }
  }
};
