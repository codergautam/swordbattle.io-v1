const find = (set, cb) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const e of set) {
    if (cb(e)) {
      return e;
    }
  }
  return undefined;
};

module.exports = class WsRoom {
  constructor(id) {
    this.id = id;
    this.clients = new Set();
  }

  addClient(client) {
    this.clients.add(client);
  }

  removeClient(clientId) {
    const client = find(this.clients, ((c) => c.id === clientId));
    if (client) {
      this.clients.delete(client);
    }
  }

  send(message, clientId) {
    const client = find(this.clients, ((c) => c.id === clientId));
    if (client) {
      client.send(message);
    }
  }

  sendAll(message) {
    // eslint-disable-next-line no-restricted-syntax
    for (const client of this.clients) {
      client.send(message);
    }
  }

  sendExcept(message, clientId) {
    // eslint-disable-next-line no-restricted-syntax
    for (const client of this.clients) {
      if (client.id !== clientId) {
        client.send(message);
      }
    }
  }
};
