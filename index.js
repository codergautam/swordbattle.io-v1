const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
var collide = require('line-circle-collision')

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const Player = require("./classes/Player")

app.use('/', express.static('phaserclient'));
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

  socket.on('mousePos', (mousePos) => {
    if(players.hasOwnProperty(socket.id)) {
    players[socket.id].mousePos = mousePos
    socket.broadcast.emit("mousePos", socket.id, mousePos)
    } else {
      socket.emit("refresh")
    }
  })

  socket.on('mouseDown', (down) => {
     if(players.hasOwnProperty(socket.id)) {
       var player =  players[socket.id]
    player.mouseDown = down;
    socket.broadcast.emit("down", socket.id, down)
    //collision v1
    Object.values(players).forEach(enemy => {
      if(enemy.id != player.id) {
    var circle = [enemy.pos.x, enemy.pos.y]
        radius = enemy.radius
        a = [player.hitbox.swordPos.x, player.hitbox.swordPos.y]
        b = [player.hitbox.hitPos.x, player.hitbox.hitPos.y]
        var hit = collide(a, b, circle, radius)
        if(hit) {
          var socketById = io.sockets.sockets.get(enemy.id);
          socketById.disconnect()
        }
      }
    })
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

  socket.on("hitbox", (hitbox) => {
    if(players.hasOwnProperty(socket.id)) {
      players[socket.id].hitbox = hitbox
      socket.emit("hitbox", hitbox)
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