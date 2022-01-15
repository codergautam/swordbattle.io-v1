const express = require("express");
const https = require("https");
var http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const app = express();
var cors = require("cors");
 

var server;
/*
if(process.env.PRODUCTION==="true") {
	var options = {
		key: fs.readFileSync("./ssl/privatekey.pem"),
		cert: fs.readFileSync("./ssl/certificate.pem"),
	};
 server = https.createServer(options, app);
} else {
 server = http.createServer(app);
} 
*/

server = http.createServer(app);

const axios = require("axios").default;
const Filter = require("purgomalum-swear-filter");
var filter = new Filter();
const moderation = require("./moderation");
const { v4: uuidv4 } = require("uuid");
var recaptcha = true;

const Player = require("./classes/Player");
const Coin = require("./classes/Coin");
const AiPlayer = require("./classes/AiPlayer");
const PlayerList = require("./classes/PlayerList");
const { sql } = require("./database");

const io = new Server(server, {
	allowRequest: (req, callback) => {
		callback(null, req.headers.origin === undefined);
	},
});
function getRandomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

var production = false;
if (production) {
	const rateLimit = require("express-rate-limit");
	const limiter = rateLimit({
		windowMs: 60 * 1000, // 1 second
		max: 25, // limit each IP to 100 requests per second
	});
	app.use("/", limiter);
}

var oldlevels = [
	{coins: 5, scale: 0.28},
	{coins: 15, scale: 0.32},
	{coins: 25, scale: 0.35},
	{coins: 35, scale: 0.4},
	{coins: 50, scale: 0.45},
	{coins: 75, scale: 0.47},
	{coins: 100, scale: 0.5},
	{coins: 125, scale: 0.51},
	{coins: 150, scale: 0.52},
	{coins: 200, scale: 0.53},
	{coins: 250, scale: 0.55},
	{coins: 350, scale: 0.57},
	{coins: 500, scale: 0.6},
	{coins: 600, scale: 0.61},
	{coins: 750, scale: 0.63},
	{coins: 900, scale: 0.65},
	{coins: 1000, scale: 0.7},
	{coins: 1100, scale: 0.71},
	{coins: 1250, scale: 0.72},
	{coins: 1500, scale: 0.74},
	{coins: 1750, scale: 0.76},
	{coins: 2000, scale: 0.77},
	{coins: 2250, scale: 0.77},
	{coins: 2500, scale: 0.85},
	{coins: 2750, scale: 0.87},
	{coins: 3000, scale: 0.9},
	{coins: 3250, scale: 0.95},
	{coins: 3500, scale: 1},
	{coins: 4000, scale: 1.02},
	{coins: 5000, scale: 1.05},
	{coins: 5500, scale: 1.07},
	{coins: 6000, scale: 1.1},
	{coins: 6500, scale: 1.2},
	{coins: 7000, scale: 1.4},
	{coins: 7500, scale: 1.55},
	{coins: 8000, scale: 1.7},
	{coins: 8500, scale: 1.8},
	{coins: 9000, scale: 1.9},
	{coins: 9500, scale: 2},
	{coins: 10000, scale: 2.2},
	{coins: 11000, scale: 2.4},
	{coins: 12000, scale: 2.6},
	{coins: 13000, scale: 2.8},
	{coins: 14000, scale: 3},
	{coins: 15000, scale: 3.2},
	{coins: 16000, scale: 3.4},
	{coins: 17000, scale: 3.6},
	{coins: 18000, scale: 3.8},
	{coins: 19000, scale: 4},
	{coins: 20000, scale: 4.2},
];
var levels = [];
oldlevels.forEach((level, index)  =>{
	if(index == 0) levels.push(Object.assign({start: 0},level)); 
	else {
		levels.push(Object.assign({start: levels[index - 1].coins}, level));
	}
});

moderation.start(app);

app.use(cors());


app.use("/", express.static("dist"));
app.use("/assets", express.static("assets"));

app.get("/leaderboard", async (req, res) => {
	//SELECT * from games where EXTRACT(EPOCH FROM (now() - created_at)) < 86400 ORDER BY coins DESC LIMIT 10
 
	//var lb= await sql`SELECT * FROM games ORDER BY coins DESC LIMIT 13`;
	var type =["coins", "kills", "time"].includes(req.query.type) ? req.query.type : "coins";
	var duration  = ["all", "day", "week"].includes(req.query.duration) ? req.query.duration : "all";
	if(duration != "all") {
		var lb = await sql`SELECT * from games where EXTRACT(EPOCH FROM (now() - created_at)) < ${duration == "day" ? "86400" : "608400"} ORDER BY ${ sql(type) } DESC LIMIT 23`;
	} else {
		var lb = await sql`SELECT * from games ORDER BY ${ sql(type) } DESC LIMIT 23`;
	}
	console.log(type, duration);
	res.render("leaderboard.ejs", {lb: lb, type: type, duration: duration});
});


Object.filter = (obj, predicate) =>
	Object.keys(obj)
		.filter((key) => predicate(obj[key]))
		.reduce((res, key) => ((res[key] = obj[key]), res), {});

var coins = [];

var maxCoins = 100;
var maxAiPlayers = 9;

io.on("connection", async (socket) => {
	socket.joinTime = Date.now();
	socket.ip = socket.handshake.headers["x-forwarded-for"];

	if (moderation.bannedIps.includes(socket.ip)) {
		socket.emit(
			"ban",
			"You are banned. Appeal to gautamgxtv@gmail.com<br><br>BANNED IP: " +
        socket.ip
		);
		socket.disconnect();
	}

	if (socket.handshake.xdomain) {
		socket.disconnect();
	}

	socket.on("go", async (name, captchatoken, secret) => {
		function ready() {
			name = name.substring(0, 16);
			filter.clean(name).then((r) => {

				var thePlayer = new Player(socket.id,  r);
				thePlayer.updateValues();

				//good luck
				if(secret == process.env.CODERGAUTAMSECRET) thePlayer.skin = "codergautamyt";
				
				PlayerList.setPlayer(socket.id, thePlayer);
				console.log("player joined -> " + socket.id);
				socket.broadcast.emit("new", thePlayer);

				var allPlayers = Object.values(PlayerList.players);
				allPlayers = allPlayers.filter((player) => player.id != socket.id);

				if (allPlayers && allPlayers.length > 0) socket.emit("players", allPlayers);
				socket.emit("coins", coins);

				socket.joined = true;
        socket.emit("levels", levels);
			}).catch((e) => {
				socket.emit("ban", e);
				socket.disconnect();
			});

		}
		if (!captchatoken && recaptcha) {
			socket.emit(
				"ban",
				"You were kicked for not sending a captchatoken. Send this message to gautamgxtv@gmail.com if you think this is a bug."
			);
			return socket.disconnect();
		}
		if (!name) {
			socket.emit("ban", "You were kicked for not sending a name. ");
			return socket.disconnect();
		}
		if (PlayerList.has(socket.id)) {
			socket.emit(
				"ban",
				"You were kicked for 2 players on 1 id. Send this message to gautamgxtv@gmail.com<br> In the meantime, try restarting your computer if this happens a lot. "
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
					"https://www.google.com/recaptcha/api/siteverify?" +
          new URLSearchParams(send)
				)
				.then((f) => {
					f = f.data;
					if (!f.success) {
						socket.emit(
							"ban",
							"Error while verifying captcha<br>" + f["error-codes"].toString()
						);
						socket.disconnect();
						return;
					}
					if (f.score < 0.3) {
						socket.emit(
							"ban",
							`Captcha score too low: ${f.score}<br><br>If you're using a vpn, disable it. <br>If your on incognito, go onto a normal window<br>If your not signed in to a google account, sign in<br><br>If none of these worked, contact gautamgxtv@gmail.com`
						);
						socket.disconnect();
						return;
					}
					ready();
				});
		} else ready();
	});

	socket.on("mousePos", (mousePos) => {
		if (PlayerList.has(socket.id)) {
			var thePlayer = PlayerList.getPlayer(socket.id);
			thePlayer.mousePos = mousePos;
			PlayerList.updatePlayer(thePlayer);
     
		}
		else socket.emit("refresh");

		//console.log(mousePos.x +" , "+mousePos.y )
	});
  
	socket.on("mouseDown", (down) => {
		if (PlayerList.has(socket.id)) {
			var player = PlayerList.getPlayer(socket.id);
			if (player.mouseDown == down) return;
			coins = player.down(down, coins, io);
			PlayerList.updatePlayer(player);
		} else socket.emit("refresh");
	});

	socket.on("move", (controller) => {
		if (!controller) return;
		try {
			if (PlayerList.has(socket.id)) {
				var player = PlayerList.getPlayer(socket.id);
				player.move(controller);
				coins = player.collectCoins(coins, io, levels);
			}
		} catch (e) {
			console.log(e);
		}
	});
	socket.on( "ping", function ( fn ) {
		fn(); // Simply execute the callback on the client
	} );
	socket.on("disconnect", () => {
		if (!PlayerList.has(socket.id)) return;
		PlayerList.deletePlayer(socket.id);
		socket.broadcast.emit("playerLeave", socket.id);
	});
});

//tick
var secondStart = Date.now();
var lastCoinSend = Date.now();
var tps = 0;

setInterval(async () => {
	//const used = process.memoryUsage().heapUsed / 1024 / 1024;
//console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
	PlayerList.clean();
	moderation.io = io;
	if (coins.length < maxCoins) {
		coins.push(new Coin());
		io.sockets.emit("coin", coins[coins.length - 1]);
	}
	var normalPlayers = Object.values(PlayerList.players).filter(p => p && !p.ai).length;
	var aiPlayers = Object.keys(PlayerList.players).length;
  
	// console.log(aiNeeded)


	if (normalPlayers > 0 && aiPlayers < maxAiPlayers && getRandomInt(0,100) == 5) {
		var id = uuidv4();
		var theAi = new AiPlayer(id);
		console.log("AI Player Joined -> "+theAi.name);
		PlayerList.setPlayer(id, theAi);
		io.sockets.emit("new", theAi);
	}
	//emit tps to clients
	if (Date.now() - secondStart >= 1000) {
		io.sockets.emit("tps", tps);
		//console.log("Players: "+Object.keys(players).length+"\nTPS: "+tps+"\n")
		secondStart = Date.now();
		tps = 0;
	}
	if (Date.now() - lastCoinSend >= 10000) {
		io.sockets.emit("coins", coins);
		lastCoinSend = Date.now();
	}

	//health regen
	var playersarray = Object.values(PlayerList.players);
	var sockets = await io.fetchSockets();

	sockets.forEach((b) => {
		if (!b.joined && Date.now() - b.joinTime > 10000) {
			b.emit(
				"ban",
				"You have been kicked for not sending JOIN packet. <br>This is likely due to slow wifi.<br>If this keeps happening, try restarting your pc."
			);
			b.disconnect();
		}
	});
	playersarray.forEach((player) => {
		if(player) {
			//   player.moveWithMouse(players)
			if(player.ai) {
				coins = player.tick(coins, io, levels);
			}
			if (
				Date.now() - player.lastHit > 5000 &&
      Date.now() - player.lastRegen > 75 &&
      player.health < player.maxHealth
			) {
				//if its been 5 seconds since player got hit, regen then every 100 ms
				player.lastRegen = Date.now();
				player.health += player.health / 100;
			}
			PlayerList.updatePlayer(player);

			//emit player data to all clients
			sockets.forEach((socket) => {
				if(!player.getSendObj()) console.log("gg");
				if (player.id != socket.id) socket.emit("player", player.getSendObj());
				else socket.emit("me", player);
			});
		}
	});
	tps += 1;
}, 1000 / 30);

server.listen(process.env.PORT || 3000, () => {
	console.log("server started");
});

/*
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers["host"] + req.url });
    res.end();
}).listen(80);
*/