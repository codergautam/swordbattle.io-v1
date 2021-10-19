const express = require('express');
const http = require('http');
const {
    Server
} = require("socket.io");
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
    .filter(key => predicate(obj[key]))
    .reduce((res, key) => (res[key] = obj[key], res), {});

var players = {}

io.on('connection', (socket) => {

    socket.on('go', async () => {
        players[socket.id] = new Player(socket.id)
        console.log("player joined -> " + socket.id)
        socket.broadcast.emit("new", players[socket.id])

        var allPlayers = Object.values(players)
        allPlayers = allPlayers.filter(player => player.id != socket.id)

        if (allPlayers && allPlayers.length > 0) socket.emit("players", allPlayers)
    })

    socket.on('mousePos', (mousePos) => {
        if (players.hasOwnProperty(socket.id)) players[socket.id].mousePos = mousePos
        else socket.emit("refresh")  
    })

    socket.on('mouseDown', (down) => {

        if (players.hasOwnProperty(socket.id)) {
            var player = players[socket.id]
            if (player.mouseDown == down) return
            player.mouseDown = down;

            //collision v1
            if (player.mouseDown)
                Object.values(players).forEach(enemy => {
                    if (enemy.id != player.id) {
                        var circle = [enemy.pos.x, enemy.pos.y]
                        radius = enemy.radius
                        a = [player.hitbox.swordPos.x, player.hitbox.swordPos.y]
                        b = [player.hitbox.hitPos.x, player.hitbox.hitPos.y]
                        var hit = collide(a, b, circle, radius)
                        if (hit) {
                          //hit
                          enemy.health -= 10
                          if(enemy.health <= 0) {
                            var socketById = io.sockets.sockets.get(enemy.id);
                            console.log(socket.id + " ---X> " + enemy.id)
                            socketById.disconnect()
                          }
                        }
                    }
                })
        } else socket.emit("refresh")
        
    })

    socket.on('move', (controller) => {
        try {
            if (players.hasOwnProperty(socket.id)) players[socket.id] = players[socket.id].move(controller)
            else socket.emit("refresh")
        } catch (e) {
            console.log(e)
        }
    })

    socket.on("hitbox", (hitbox) => {
        if (players.hasOwnProperty(socket.id)) {
            players[socket.id].hitbox = hitbox
            socket.emit("hitbox", hitbox)
        } else socket.emit("refresh")
        
    })

    socket.on('disconnect', () => {
        players = Object.filter(players, player => player.id != socket.id)
        console.log("player left/killed -> " + socket.id)
        socket.broadcast.emit("playerLeave", socket.id)
    })
});

//tick 120 times per second
setInterval(async () => {
 
    var playersarray = Object.values(players)
    var sockets = await io.fetchSockets()
    playersarray.forEach(player => {
        //do something
        sockets.forEach(socket => {
            if (player.id != socket.id) socket.emit("player", player)
            else socket.emit("me", player)
        })
    });
    
}, 1000 / 120)

server.listen(3000, () => {
    console.log('server started');
});