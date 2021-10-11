const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const Player = require("./classes/Player")

app.use('/', express.static('client'));
app.use('/classes', express.static('classes'));


io.on('connection', (socket) => {
  //console.log('a user connected');

  socket.on('go', () => {
    socket.player = new Player(socket.id)
    socket.broadcast.emit("new", socket.player)
   io.fetchSockets().then((all) => {
  all.filter(thesocket => thesocket.hasOwnProperty("player") && thesocket.id != socket.id)
  if(all && all.length > 0) {

  var allPlayers = []
      console.log("all:")
    console.log(allPlayers)
  all.forEach(socket => allPlayers[allPlayers.length]= socket.player)
  socket.emit("players", allPlayers)
  }
   })

  })

  socket.on('angle', (angle) => {
    socket.player.angle = angle
    socket.broadcast.emit("angle", socket.id, angle)
  })

  socket.on('mouseDown', (down) => {
    socket.player.mouseDown = down;
    socket.broadcast.emit("down", socket.id, down)
  })

  socket.on('move', (controller) => {
    socket.player.move(controller)

    socket.emit("myPos", socket.player.pos)
    socket.broadcast.emit("move", socket.id, socket.player.pos)
  })
});
/*
//tick 120 times per second
setInterval(async () => {
  var sockets= await io.fetchSockets()
  sockets.forEach(socket => {
    //do something
  });
}, 1000/120) */

server.listen(3000, () => {
  console.log('server started');
});