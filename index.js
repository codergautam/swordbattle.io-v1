const express = require('express');
const http = require('http');
require('dotenv').config();
const { Server } = require('socket.io');
const fs = require('fs');
const app = express();
var cors = require('cors');
const server = http.createServer(app);
var JavaScriptObfuscator = require('javascript-obfuscator');
const axios = require('axios').default;

const Player = require('./classes/Player');
const Coin = require('./classes/Coin');

var bannedIps = [
  '34.133.168.193',
  '209.205.218.44',
  '23.227.141.157',
  '78.58.116.9',
  '73.222.174.240',
  '78.58.116.96',
  '34.135.84.39',
  '73.222.174.240',
];
var safeIp = [];

const io = new Server(server, {
  allowRequest: (req, callback) => {
    callback(null, req.headers.origin === undefined);
  },
});

var production = true;
if (production) {
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  app.use('/', limiter);
}

var mainjs = fs.readFileSync('./dist/main.js').toString();
var obfuscate = false;
if (obfuscate) {
  mainjs = JavaScriptObfuscator.obfuscate(mainjs, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    debugProtection: false,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: false,
    renameGlobals: true,
    renameProperties: false,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 42,
    numbersToExpressions: true,
    stringArrayThreshold: 1,
    selfDefending: true,
    target: 'browser',
    transformObjectKeys: true,
    unicodeEscapeSequence: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayIndexesType: ['hexadecimal-number'],
    stringArrayEncoding: [],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
  }).getObfuscatedCode();
}

app.use(cors());

app.use('/:file', (req, res, next) => {
  if (req.params.file == 'main.js') {
    res.set('Content-Type', 'text/javascript');
    res.send(mainjs);
  } else if (['index.html', 'textbox.html'].includes(req.params.file)) {
    res.sendFile(__dirname + '/dist/' + req.params.file);
  } else {
    next();
  }
});

app.use('/kaboomclient', express.static('kaboomclient'));
app.use('/assets', express.static('assets'));
app.use('/classes', express.static('classes'));
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter((key) => predicate(obj[key]))
    .reduce((res, key) => ((res[key] = obj[key]), res), {});

var players = {};
var coins = [];

var maxCoins = 100;
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.get('/ipcheck/:token', (req, res) => {
  if (process.env.TOKEN == req.params.token) {
    var txt = '';
    if (Object.values(players).length < 1) return res.send('len 0');
    Object.values(players).forEach((player) => {
      var socket = io.sockets.sockets.get(player.id);
      txt += player.name + ' - ' + socket.ip + '<br>';
    });
    res.send(txt);
  } else {
    res.send('idot hackrs');
  }
});
app.get('/ipban/:token', (req, res) => {
  var token = req.params.token == process.env.TOKEN;
  if (token) {
    bannedIps.push(req.query.ip);
    res.send(bannedIps.toString());
  } else {
    res.send('idot');
  }
});
app.get('/ipunban/:token', (req, res) => {
  var token = req.params.token == process.env.TOKEN;
  if (token) {
    if (bannedIps.includes(req.query.ip))
      bannedIps = bannedIps.filter((b) => b != req.query.ip);
    res.send(bannedIps.toString());
  } else {
    res.send('idot');
  }
});

io.on('connection', async (socket) => {
  socket.joinTime = Date.now();
  socket.ip = socket.handshake.headers['x-forwarded-for'];

  if (!socket.ip || !safeIp.includes(socket.ip)) {
    if (bannedIps.includes(socket.ip)) {
      socket.emit(
        'ban',
        'You are banned. Appeal to gautamgxtv@gmail.com<br><br>BANNED IP: ' +
          socket.ip
      );
      socket.disconnect();
    } else {
      console.log(`https://proxycheck.io/v2/${socket.ip}?vpn=1&asn=1`);
      axios
        .get(`https://proxycheck.io/v2/${socket.ip}?vpn=1&asn=1`)
        .then((d) => {
          var json = d.data;
          if (json.status == 'ok' && json[socket.ip].type == 'VPN') {
            //uh oh, looks like someones on a vpn
            bannedIps.push(socket.ip);
            socket.emit('ban', 'VPNs are not allowed. Sorry!');
            console.log('\n\n' + socket.id + ' BANNED FOR VPN!!!\n\n');
            socket.disconnect();
          } else if (json.status == 'ok' && json[socket.ip].type != 'VPN') {
            safeIp.push(socket.ip);
          }
        });
    }
  }
  //prevent idot sedated from botting
  if (socket.handshake.xdomain) {
    socket.disconnect();
  }

  socket.on('go', async (name, captchatoken) => {
    if (!captchatoken) {
      socket.emit(
        'ban',
        'You were kicked for not sending a captchatoken. Send this message to gautamgxtv@gmail.com if you think this is a bug.'
      );
      return socket.disconnect();
    }
    if (!name) {
      socket.emit('ban', 'You were kicked for not sending a name. ');
      return socket.disconnect();
    }
    if (players[socket.id]) {
      socket.emit(
        'ban',
        'You were kicked for 2 players on 1 id. Send this message to gautamgxtv@gmail.com<br> In the meantime, try restarting your computer if this happens a lot. '
      );
      return socket.disconnect();
    }

    var send = {
      secret: process.env.CAPTCHASECRET,
      response: captchatoken,
      remoteip: socket.ip,
    };

    axios
      .post(
        'https://www.google.com/recaptcha/api/siteverify?' +
          new URLSearchParams(send)
      )
      .then((f) => {
        f = f.data;
        if (!f.success) {
          socket.emit(
            'ban',
            'Error while verifying captcha<br>' + f['error-codes'].toString()
          );
          socket.disconnect();
          return;
        }
        if (f.score < 0.3) {
          socket.emit(
            'ban',
            `Captcha score too low: ${f.score}<br><br>If you're using a vpn, disable it. <br>If your on incognito, go onto a normal window<br>If your not signed in to a google account, sign in<br><br>If none of these worked, contact gautamgxtv@gmail.com`
          );
          socket.disconnect();
          return;
        }
        name = name.substring(0, 16);
        players[socket.id] = new Player(socket.id, name);
        players[socket.id].updateValues();
        console.log('player joined -> ' + socket.id);
        socket.broadcast.emit('new', players[socket.id]);

        var allPlayers = Object.values(players);
        allPlayers = allPlayers.filter((player) => player.id != socket.id);

        if (allPlayers && allPlayers.length > 0)
          socket.emit('players', allPlayers);
        socket.emit('coins', coins);

        socket.joined = true;
      });
  });

  socket.on('mousePos', (mousePos) => {
    if (players.hasOwnProperty(socket.id))
      players[socket.id].mousePos = mousePos;
    else socket.emit('refresh');

    //console.log(mousePos.x +" , "+mousePos.y )
  });

  socket.on('mouseDown', (down) => {
    if (players.hasOwnProperty(socket.id)) {
      var player = players[socket.id];
      if (player.mouseDown == down) return;
      player.mouseDown = down;

      //collision v1
      //hit cooldown
      if (player.mouseDown && Date.now() - player.lastDamageDealt > 1000 / 7) {
        Object.values(players).forEach((enemy) => {
          //loop through all enemies, make sure the enemy isnt the player itself
          if (enemy.id != player.id) {
            //get the values needed for line-circle-collison

            //check if enemy and player colliding
            if (
              player.hittingPlayer(enemy) &&
              Date.now() - enemy.joinTime >= 5000
            ) {
              var socketById = io.sockets.sockets.get(enemy.id);
              socket.emit('dealHit', enemy.id);
              socketById.emit('takeHit', socket.id);
              //if colliding
              player.lastDamageDealt = Date.now();
              enemy.lastHit = Date.now();
              var oldHealth = enemy.health;
              enemy.health -= player.damage;
              if (enemy.health <= 0 && oldHealth * 2 >= enemy.maxHealth)
                enemy.health = enemy.maxHealth * 0.1;
              if (enemy.health <= 0) {
                //enemy has 0 or less than 0 health, time to kill

                //increment killcount by 1
                player.kills += 1;

                //tell clients that this enemy died

                socketById.emit('youDied', {
                  killedBy: player.name,
                  timeSurvived: Date.now() - enemy.joinTime,
                });
                socketById.broadcast.emit('playerDied', enemy.id, {
                  killedBy: player.name,
                });

                //drop their coins

                //cant drop more than 1k coins (for lag reasons)
                for (var i = 0; i < clamp(enemy.coins, 5, 1000); i++) {
                  r = enemy.radius * enemy.scale * Math.sqrt(Math.random());
                  theta = Math.random() * 2 * Math.PI;
                  x = enemy.pos.x + r * Math.cos(theta);
                  y = enemy.pos.y + r * Math.sin(theta);

                  coins.push(
                    new Coin({
                      x: clamp(x, -2500, 2500),
                      y: clamp(y, -2500, 2500),
                    })
                  );
                  socketById.broadcast.emit('coin', coins[coins.length - 1]);
                }

                //log a message
                console.log('player died -> ' + enemy.id);

                //delete the enemy
                delete players[enemy.id];

                //disconnect the socket
                socketById.disconnect();
              } else {
                enemy.doKnockback(player);
              }
            }
          }
        });
      }
    } else socket.emit('refresh');
  });

  socket.on('move', (controller) => {
    if (!controller) return;
    try {
      if (players.hasOwnProperty(socket.id)) {
        var player = players[socket.id];
        players[socket.id] = player.move(controller, players);

        touching = coins.filter((coin) => coin.touchingPlayer(player));

        touching.forEach((coin) => {
          player.coins += 1;
          if (player.scale > 7.5) var increase = 0.01;
          else if (player.scale > 5) var increase = 0.001;
          else var increase = 0.0005;
          player.scale += increase;
          var index = coins.findIndex((e) => e.id == coin.id);
          coins.splice(index, 1);

          player.updateValues();
          io.sockets.emit('collected', coin.id, player.id);
        });

        if (player.scale >= 10) {
          //yay you have conquered the map!
          var socketById = io.sockets.sockets.get(player.id);
          socketById.emit('youWon', {
            timeSurvived: Date.now() - player.joinTime,
          });
          socketById.broadcast.emit('playerDied', player.id);

          //delete the player
          delete players[player.id];

          //disconnect the player
          socketById.disconnect();
        }
      } else socket.emit('refresh');
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('disconnect', () => {
    if (!Object.keys(players).includes(socket.id)) return;
    delete players[socket.id];
    socket.broadcast.emit('playerLeave', socket.id);
  });
});

//tick
var secondStart = Date.now();
var lastCoinSend = Date.now();
var tps = 0;

setInterval(async () => {
  if (coins.length < maxCoins) {
    coins.push(new Coin());
    io.sockets.emit('coin', coins[coins.length - 1]);
  }
  //emit tps to clients
  if (Date.now() - secondStart >= 1000) {
    io.sockets.emit('tps', tps);
    //console.log("Players: "+Object.keys(players).length+"\nTPS: "+tps+"\n")
    secondStart = Date.now();
    tps = 0;
  }
  if (Date.now() - lastCoinSend >= 10000) {
    io.sockets.emit('coins', coins);
    lastCoinSend = Date.now();
  }

  //health regen
  var playersarray = Object.values(players);
  var sockets = await io.fetchSockets();

  sockets.forEach((b) => {
    if (!b.joined && Date.now() - b.joinTime > 5000) {
      b.emit(
        'ban',
        'You have been kicked for not joining. This is likely due to slow wifi or a hack.'
      );
      b.disconnect();
    }
  });
  playersarray.forEach((player) => {
    //   player.moveWithMouse(players)
    if (
      Date.now() - player.lastHit > 5000 &&
      Date.now() - player.lastRegen > 100 &&
      player.health < player.maxHealth
    ) {
      //if its been 5 seconds since player got hit, regen then every 100 ms
      player.lastRegen = Date.now();
      player.health += player.health / 100;
    }

    //emit player data to all clients
    sockets.forEach((socket) => {
      if (player.id != socket.id) socket.emit('player', player);
      else socket.emit('me', player);
    });
  });
  tps += 1;
}, 1000 / 30);

server.listen(process.env.PORT || 3000, () => {
  console.log('server started');
});
