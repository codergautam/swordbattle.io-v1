
const express = require('express');
const http = require('http');
const {
    Server
} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const Player = require("./classes/Player")
const Coin = require("./classes/Coin")

app.use('/', express.static('phaserclient'));
app.use('/kaboomclient', express.static('kaboomclient'));
app.use('/assets', express.static('assets'));
app.use('/classes', express.static('classes'));

Object.filter = (obj, predicate) =>
    Object.keys(obj)
    .filter(key => predicate(obj[key]))
    .reduce((res, key) => (res[key] = obj[key], res), {});

var players = {}
var coins = [];

var maxCoins = 100;

io.on('connection', (socket) => {

    socket.on('go', async (name) => {
      if(!name) return
         name = name.substring(0, 16)
        players[socket.id] = new Player(socket.id, name)
        console.log("player joined -> " + socket.id)
        socket.broadcast.emit("new", players[socket.id])

        var allPlayers = Object.values(players)
        allPlayers = allPlayers.filter(player => player.id != socket.id)

        if (allPlayers && allPlayers.length > 0) socket.emit("players", allPlayers)
        socket.emit("coins", coins)
    })

    socket.on('mousePos', (mousePos) => {
        if (players.hasOwnProperty(socket.id)) players[socket.id].mousePos = mousePos
        else socket.emit("refresh")  
       
        //console.log(mousePos.x +" , "+mousePos.y )
    })

    socket.on('mouseDown', (down) => {

        if (players.hasOwnProperty(socket.id)) {
            var player = players[socket.id]
            if (player.mouseDown == down) return
            player.mouseDown = down;

            //collision v1
                                                                        //hit cooldown
            if (player.mouseDown&& Date.now() - player.lastDamageDealt > (1000/7)) { 
                Object.values(players).forEach(enemy => {
                    //loop through all enemies, make sure the enemy isnt the player itself
                    if (enemy.id != player.id) {

                        //get the values needed for line-circle-collison
                        
                        //check if enemy and player colliding
                        if (player.hittingPlayer(enemy)) {
                          //if colliding
                          player.lastDamageDealt = Date.now()
                          enemy.lastHit = Date.now()
                          enemy.health -= player.damage
enemy.doKnockback(player)
                          if(enemy.health <= 0) {
                              //enemy has 0 or less than 0 health, time to kill

                              //increment killcount by 1
                            player.kills += 1
                            
                            //tell clients that this enemy died
                            var socketById = io.sockets.sockets.get(enemy.id);
                            socketById.emit("youDied", {killedBy: player.name, timeSurvived: Date.now() - enemy.joinTime})
                            socketById.broadcast.emit("playerDied",enemy.id, {killedBy: player.name})

                            //drop their coins
                            const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
                            //cant drop more than 1k coins (for lag reasons)
                            for(var i=0; i < clamp(enemy.coins, 5, 1000); i++){
                                r = enemy.radius * enemy.scale * Math.sqrt(Math.random())
                                theta = Math.random() * 2 * Math.PI
                                x = enemy.pos.x + r * Math.cos(theta)
                                y = enemy.pos.y + r * Math.sin(theta)

                                coins.push(new Coin({x: x, y: y}))
                                io.sockets.emit("coin", coins[coins.length -1])
                            }
                            //delete the enemy
                            delete players[enemy.id]   
                            
                            //disconnect the socket
                            socketById.disconnect()
                            
                            
                          }
                        }
                    }
                })
            }
        } else socket.emit("refresh")
        
    })

    socket.on('move', (controller) => {
        try {
            if (players.hasOwnProperty(socket.id)) {
                var player = players[socket.id]
                players[socket.id] = player.move(controller, players)
                if(player.lastPos.x == player.pos.x && player.lastPos.y == player.pos.y) return
                
                touching  = coins.filter(coin => coin.touchingPlayer(player))
               
                touching.forEach((coin) => {
                    player.coins += 1
                    if(player.scale > 7.5) var increase = 0.0001
                    else if(player.scale > 5) var increase = 0.0005
                    else var increase = 0.001
                    player.scale += increase
                    var index = coins.findIndex(e=>e.id == coin.id)
                    coins.splice(index, 1)

                    player.updateValues()
                    io.sockets.emit("collected", coin.id, player.id)
                })

                if(player.scale >= 10) {
                    //yay you have conquered the map!
                    var socketById = io.sockets.sockets.get(player.id);
                    socketById.emit("youWon", {timeSurvived: Date.now() - player.joinTime})
                    socketById.broadcast.emit("playerDied",player.id)

                    //delete the player
                    delete players[player.id]   
                    
                    //disconnect the player
                    socketById.disconnect()
                }
           
            }
            else socket.emit("refresh")
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('disconnect', () => {
        if(!Object.keys(players).includes(socket.id)) return
        delete players[socket.id]
        console.log("player left -> " + socket.id)
        socket.broadcast.emit("playerLeave", socket.id)
    })
});

//tick
var secondStart = Date.now()
var lastCoinSend = Date.now()
var tps = 0;

setInterval(async () => {
    if(coins.length < maxCoins) { 
        coins.push(new Coin())
        io.sockets.emit("coin", coins[coins.length - 1])
    }
    //emit tps to clients
    if(Date.now() - secondStart >= 1000) {
      io.sockets.emit("tps", tps)
      secondStart = Date.now()
      tps = 0
    }
    if(Date.now() - lastCoinSend >= 10000) {
        io.sockets.emit("coins", coins)
        lastCoinSend = Date.now()
    }

    //health regen
    var playersarray = Object.values(players)
    var sockets = await io.fetchSockets()
    playersarray.forEach(player => {
     //   player.moveWithMouse(players)
      if((Date.now() - player.lastHit > 5000) && (Date.now() - player.lastRegen > 100) && (player.health < player.maxHealth)) {
        //if its been 5 seconds since player got hit, regen then every 100 ms
        player.lastRegen = Date.now()
        player.health += (player.health / 100)
      }

      //emit player data to all clients
        sockets.forEach(socket => {
            if (player.id != socket.id) socket.emit("player", player)
            else socket.emit("me", player)
        })


    });
    tps += 1
    
}, 1000 / 20)

server.listen(3000, () => {
    console.log('server started');
});