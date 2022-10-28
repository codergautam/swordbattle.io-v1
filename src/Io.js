
const io = function(url) {
  const ws = new WebSocket(url);
  return new Socket(ws);
};
//Eventemitter
import EventEmitter from "eventemitter3";

class Socket extends EventEmitter  {
  constructor(ws) {
    super();
    this.socket = ws;
    this.connected = false;
    this.socket.onopen = () => {
      console.log("ws connection created");
    };
    this.socket.onclose = () => {
      console.log("ws connection closed");
      this.connected = false;
      this.emit("connect_error", "The connection was disconnected.<br/>This may be a result of slow wifi<br/>Try restarting your device if this happens a lot, if you think it is a server-side issue, please contact us");
    
    };
    this.socket.onerror = (e) => {
      console.log("ws connection error", e);
      this.connected = false;
      this.emit("connect_error", "The connection was disconnected due to an error.<br/>This may be a result of slow wifi<br/>Try restarting your device if this happens a lot,  if you think it is a server-side issue, please contact us");
    };
    this.socket.onmessage = (data) => {
      var message;
      try {
        message = JSON.parse(data.data);
      } catch {
        return;
      }
      this.emit(message.t, message.d);

      if(message.t === "id") {
        this.id = message.d;
        this.connected = true;
      this.emit("connected");

      }
    };

  }
  send(...args) {
    if(!this.connected) return;
    if(args.length == 2) {
      this.socket.send(JSON.stringify({
        t: args[0],
        d: args[1]
      }));
    } else {
      console.trace("TOO MUCH DATA, DISCONNECTED");
    }
  }
  disconnect() {
    this.socket.close();
  }
}

export default io;
