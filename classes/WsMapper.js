const { EventEmitter } = require("events");

const uuid = require("uuid");



class Socket extends EventEmitter {
  constructor(ws, req, mapper) {
    super();
    this.ws = ws;
    this.mapper = mapper;
    this.id = uuid.v4();
    this.ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.connection.remoteAddress;
    this.ws.send(JSON.stringify({
      t: "id",
      d: this.id
    }));

    this.ws.on("message", (data) => {
      var message;
      try {
        message = JSON.parse(data);
      } catch {
        return;
      }

      this.emit(message.t, message.d);
      
    }); 
    this.ws.on("close", () => {
      this.emit("disconnect");

      this.mapper.clients.delete(this.id);
    });
  }

  send(...args) {
    if(args.length > 2) return console.trace("TOO MUCH DATA");
    var toSend = {
      t: args[0],
      d: args[1]
    };
    this.ws.send(JSON.stringify(toSend));
  }

  get broadcast() {
    return {
      send: (...args) => {
        this.mapper.getSocketsSync().filter(s=>s.id != this.id).forEach((s) => {
          s.send(...args);
        });
      }
    };
  }

  disconnect() {
    this.ws.close();
    this.mapper.clients.delete(this.id);
  }
}

module.exports = class WsMapper extends EventEmitter {
  constructor(wss) {
    super();
    this.wss = wss;
    this.clients = new Map();
    this.wss.on("connection", (ws, req) => {
      const socket = new Socket(ws, req, this);
      this.clients.set(socket.id, socket);
      this.emit("connection", socket);
    }); 
  }
  async fetchSockets() {
    return this.getSocketsSync();
  }
  getSocketsSync() {
    return [...this.clients.values()];
  }
  get sockets () {
    return {
      send: (event, data) => {
        this.getSocketsSync().forEach((socket) => {
          socket.send(event, data);
        });
      },
      sockets: {
        get: (id) => {
          return this.clients.get(id);
        }
      }
    };
  }

};