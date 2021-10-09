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

  
});

server.listen(3000, () => {
  console.log('server started');
});