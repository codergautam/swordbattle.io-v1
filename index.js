
const express = require('express');
const http = require('http');
const {
    Server
} = require("socket.io");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);
var bannedIps = ["78.58.116.9", "73.222.174.240", "78.58.116.96", "34.135.84.39", "73.222.174.240", "23.227.140.172"];
const io = new Server(server,   {
  allowRequest: (req, callback) => {
    callback(null, req.headers.origin === undefined);
  }
  });
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use("/", limiter)
const Player = require("./classes/Player")
const Coin = require("./classes/Coin")

app.use('/', express.static('phaserclient'));
app.use('/kaboomclient', express.static('kaboomclient'));
app.use('/assets', express.static('assets'));
app.use('/classes', express.static('classes'));
           const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
Object.filter = (obj, predicate) =>
    Object.keys(obj)
    .filter(key => predicate(obj[key]))
    .reduce((res, key) => (res[key] = obj[key], res), {});

var players = {}
var coins = [];

var maxCoins = 100;

app.get("/ipban", (req,res) => {
    
 var token = req.query.token == process.env.TOKEN
 if(token) {
     bannedIps.push(req.query.ip)
     res.send(bannedIps.toString())
 } else {
     res.send("idot")
 }
})


app.get("/iplist", async (req,res) => {
 var token = req.query.token == process.env.TOKEN
 if(token) {
     var txt = ""
     players.forEach((player) => {
        var socket = io.sockets.sockets.get(player.id);
         txt += player.name+" - "+socket.ip+"<br>"
     })
     res.send(txt)
     
 } else {
      res.send("idot")
 }
})

io.on('connection', (socket) => {
    console.log(socket.handshake.headers)
    socket.ip = socket.handshake.headers['x-forwarded-for']
    if(!socket.ip) socket.disconnect()
    
  //prevent idot sedated from botting
if(socket.handshake.xdomain) {
   console.log(socket.id +" kicked for xdomain")
  socket.disconnect()
}

    socket.on('go', async (name) => {
       
      if(!name) return
      if(players[socket.id]) return
        console.log(socket.ip.toString())
        if(bannedIps.includes(socket.ip.toString())) {
            console.log(name +" BANNED DUE TO IP BAN")
            socket.disconnect()
            return
        }
         name = name.substring(0, 16)
        players[socket.id] = new Player(socket.id, name)
         players[socket.id].updateValues()
        console.log("player joined -> " + socket.id)
        socket.broadcast.emit("new", players[socket.id])

        var allPlayers = Object.values(players)
        allPlayers = allPlayers.filter(player => player.id != socket.id)

        if (allPlayers && allPlayers.length > 0) socket.emit("players", allPlayers)
        socket.emit("coins", coins)
        
        console.log(name +" joined successfully with IP "+socket.ip)
        
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
                        if (player.hittingPlayer(enemy) && Date.now() - enemy.joinTime >= 5000) {
                            var socketById = io.sockets.sockets.get(enemy.id);
                            socket.emit("dealHit", enemy.id)
                            socketById.emit("takeHit", socket.id)
                          //if colliding
                          player.lastDamageDealt = Date.now()
                          enemy.lastHit = Date.now()
                          var oldHealth = enemy.health
                          enemy.health -= player.damage
                          if(enemy.health <= 0 && oldHealth * 2 >= enemy.maxHealth) enemy.health = enemy.maxHealth*0.1
                          if(enemy.health <= 0) {
                              //enemy has 0 or less than 0 health, time to kill

                              //increment killcount by 1
                            player.kills += 1
                            
                            //tell clients that this enemy died
                            
                            socketById.emit("youDied", {killedBy: player.name, timeSurvived: Date.now() - enemy.joinTime})
                            socketById.broadcast.emit("playerDied",enemy.id, {killedBy: player.name})

                            //drop their coins
                 
                            //cant drop more than 1k coins (for lag reasons)
                            for(var i=0; i < clamp(enemy.coins, 5, 1000); i++){
                                r = enemy.radius * enemy.scale * Math.sqrt(Math.random())
                                theta = Math.random() * 2 * Math.PI
                                x = enemy.pos.x + r * Math.cos(theta)
                                y = enemy.pos.y + r * Math.sin(theta)

                                coins.push(new Coin({x: clamp(x,-2500, 2500) , y: clamp(y, -2500, 2500)}))
                                socketById.broadcast.emit("coin", coins[coins.length -1])
                            }
                            
                            //log a message
                            console.log("player died -> "+enemy.id)
                            
                            //delete the enemy
                            delete players[enemy.id]   

                            
                            //disconnect the socket
                            socketById.disconnect()
                            
                            
                          } else {
                            enemy.doKnockback(player)
                          }
                        }
                    }
                })
            }
        } else socket.emit("refresh")
        
    })

    socket.on('move', (controller) => {
      if(!controller) return
        try {
            if (players.hasOwnProperty(socket.id)) {
                var player = players[socket.id]
                players[socket.id] = player.move(controller, players)
                
                touching  = coins.filter(coin => coin.touchingPlayer(player))
               
                touching.forEach((coin) => {
                    player.coins += 1
                    if(player.scale > 7.5) var increase = 0.01
                    else if(player.scale > 5) var increase = 0.001
                    else var increase = 0.0005
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
      console.log("Players: "+Object.keys(players).length+"\nTPS: "+tps+"\n")
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
    
}, 1000 / 30)

server.listen(process.env.PORT || 3000, () => {
    console.log('server started');
});
