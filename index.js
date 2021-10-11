const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Player = require("./classes/Player")

var players = []
app.use('/', express.static('client'));
app.use('/classes', express.static('classes'));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('go', () => {
    socket.player = new Player()
  })

  socket.on('angle', (angle) => {
    socket.player.angle = angle
    console.log(socket.player)
  })

  socket.on('mouseDown', (down) => {
    socket.player.mouseDown = down;
  })

  socket.on('move', (controller) => {
    if(controller.up) socket.player.pos.y += socket.player.speed
    if(controller.down) socket.player.pos.y -= socket.player.speed
    if(controller.right) socket.player.pos.x += socket.player.speed
    if(controller.left) socket.player.pos.x -= socket.player.speed
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