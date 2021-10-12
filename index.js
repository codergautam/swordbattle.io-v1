const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const Player = require("./classes/Player")

app.use('/', express.static('pixiclient'));
app.use('/kaboomclient', express.static('kaboomclient'));
app.use('/assets', express.static('assets'));
app.use('/classes', express.static('classes'));

Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );

var players = {}

io.on('connection', (socket) => {
  console.log('a user connected\n'+socket.id);


  socket.on('go', async () => {
    players[socket.id] = new Player(socket.id)
    socket.broadcast.emit("new", players[socket.id])

  var allPlayers = Object.values(players)
  allPlayers = allPlayers.filter(player => player.id != socket.id)

  if(allPlayers && allPlayers.length > 0) {
    socket.emit("players", allPlayers)
    console.log(allPlayers)
  }
   

  })

  socket.on('angle', (angle) => {
    if(players.hasOwnProperty(socket.id)) {
    players[socket.id].angle = angle
    socket.broadcast.emit("angle", socket.id, angle)
    } else {
      socket.emit("refresh")
    }
  })

  socket.on('mouseDown', (down) => {
     if(players.hasOwnProperty(socket.id)) {
    players[socket.id].mouseDown = down;
    socket.broadcast.emit("down", socket.id, down)
     } else {
       socket.emit("refresh")
     }
  })

  socket.on('move', (controller) => {
     if(players.hasOwnProperty(socket.id)) {
    players[socket.id] = players[socket.id].move(controller)

    socket.emit("myPos", players[socket.id].pos)
    socket.broadcast.emit("move", socket.id, players[socket.id].pos)
     } else {
       socket.emit("refresh")
     }
  })

  socket.on('disconnect', () => {
    players = Object.filter(players, player => player.id != socket.id)
    socket.broadcast.emit("playerLeave", socket.id)
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