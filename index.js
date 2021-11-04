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
const moderation = require("./moderation")
const { v4: uuidv4 } = require('uuid');
var recaptcha = false

const Player = require('./classes/Player');
const Coin = require('./classes/Coin');
const AiPlayer = require('./classes/AiPlayer');
const PlayerList = require('./classes/PlayerList')

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

moderation.start(app)

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
  } else if (['index.html', 'textbox.html', 'main.js.map'].includes(req.params.file)) {
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

var coins = [];

var maxCoins = 100;
var maxAiPlayers = 5;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});



io.on('connection', async (socket) => {
  socket.joinTime = Date.now();
  socket.ip = socket.handshake.headers['x-forwarded-for'];

  if (moderation.bannedIps.includes(socket.ip)) {
    socket.emit(
      'ban',
      'You are banned. Appeal to gautamgxtv@gmail.com<br><br>BANNED IP: ' +
        socket.ip
    );
    socket.disconnect();
  }

  if (socket.handshake.xdomain) {
    socket.disconnect();
  }

  socket.on('go', async (name, captchatoken) => {
    function ready() {
              name = name.substring(0, 16);
        var thePlayer = new Player(socket.id, name);
        thePlayer.updateValues();
        PlayerList.setPlayer(socket.id, thePlayer)
        console.log('player joined -> ' + name);
        socket.broadcast.emit('new', thePlayer);

        var allPlayers = Object.values(PlayerList.players);
        allPlayers = allPlayers.filter((player) => player.id != socket.id);

        if (allPlayers && allPlayers.length > 0)
          socket.emit('players', allPlayers);
        socket.emit('coins', coins);

        socket.joined = true;
    }
    if (!captchatoken && !recaptcha) {
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
    if (PlayerList.has(socket.id)) {
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
  if(recaptcha) {
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
        ready();

      });
  } else ready()
  });

  socket.on('mousePos', (mousePos) => {
    if (PlayerList.has(socket.id)) {
     var thePlayer = PlayerList.getPlayer(socket.id)
     thePlayer.mousePos = mousePos;
     PlayerList.updatePlayer(thePlayer)
     
    }
    else socket.emit('refresh');

    //console.log(mousePos.x +" , "+mousePos.y )
  });
  
  socket.on('mouseDown', (down) => {
    if (PlayerList.has(socket.id)) {
      var player = PlayerList.getPlayer(socket.id);
      if (player.mouseDown == down) return;
       coins = player.down(down, coins, io)
       PlayerList.updatePlayer(player)
    } else socket.emit('refresh');
  });

  socket.on('move', (controller) => {
    if (!controller) return;
    try {
      if (PlayerList.has(socket.id)) {
        var player = PlayerList.getPlayer(socket.id);
        player.move(controller);
        coins = player.collectCoins(coins, io)
      }
    } catch (e) {
      console.log(e);
    }
  });

  socket.on('disconnect', () => {
    if (!PlayerList.has(socket.id)) return;
    PlayerList.deletePlayer(socket.id)
    socket.broadcast.emit('playerLeave', socket.id);
  });
});

//tick
var secondStart = Date.now();
var lastCoinSend = Date.now();
var tps = 0;

setInterval(async () => {
  moderation.io = io
  if (coins.length < maxCoins) {
    coins.push(new Coin());
    io.sockets.emit('coin', coins[coins.length - 1]);
  }
  if (Object.values(PlayerList.players).filter(p => p && p.ai).length < maxAiPlayers) {
    var id = uuidv4()
    var theAi = new AiPlayer(id)
    console.log("AI Player Joined -> "+id)
    PlayerList.setPlayer(id, theAi)
    io.sockets.emit('new', theAi)
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
  var playersarray = Object.values(PlayerList.players);
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
    if(player) {
    //   player.moveWithMouse(players)
    if(player.ai) {
     coins = player.tick(coins, io)
    }
    if (
      Date.now() - player.lastHit > 5000 &&
      Date.now() - player.lastRegen > 100 &&
      player.health < player.maxHealth
    ) {
      //if its been 5 seconds since player got hit, regen then every 100 ms
      player.lastRegen = Date.now();
      player.health += player.health / 100;
    }
    PlayerList.updatePlayer(player)

    //emit player data to all clients
    sockets.forEach((socket) => {
      if (player.id != socket.id) socket.emit('player', player.getSendObj());
      else socket.emit('me', player);
    });
  }
  });
  tps += 1;
}, 1000 / 30);

server.listen(process.env.PORT || 3000, () => {
  console.log('server started');
});
