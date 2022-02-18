const express = require("express");
const https = require("https");
var http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const app = express();
var cors = require("cors");
var emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
var uuid = require("uuid");

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
var passwordValidator = require("password-validator");
var schema = new passwordValidator();
app.use(express.json());
// Add properties to it
schema
.is().min(5, "Password has to be at least 5 chars")                                    // Minimum length 5
.is().max(20, "Password cant be longer than 20 chars")                                  // Maximum length 20
.has().not().spaces(undefined, "Password cant contain spaces");                          // Should not have spaces


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

app.post("/api/signup", async (req, res) => {
	if(!req.body || req.body.password == undefined || req.body.username == undefined) {	
		res.send({error: "Missing fields"});
		return;
	}
	if(req.body.email && req.body.email.length > 30) {
		res.send({error: "Email too long"});
		return;
	}
	if(req.body.email && !emailValidator.validate(req.body.email)) {
		res.send({error: "Invalid email"});
		return;
	}
	if(!schema.validate(req.body.password)) {
		res.send({error:schema.validate(req.body.password, { details: true })[0].message});
		return;
	}
	var username = req.body.username;
	if(username.length > 20) {
		res.send({error: "Username has to be shorter than 20 characters"});
		return;
	}
	if(username.charAt(0) == " " || username.charAt(username.length - 1) == " ") {
		res.send({error: "Username can't start or end with a space"});
		return;
	}
	if(username.includes("  ")) {
		res.send({error: "Username can't have two spaces in a row"});
		return;
	}
	var regex = /^[a-zA-Z0-9!@"$%&:';()*\+,;\-=[\]\^_{|}<>~` ]+$/g;
	if(!username.match(regex)) {
		res.send({error: "Username can only contain letters, numbers, spaces, and the following symbols: !@\"$%&:';()*\+,-=[\]\^_{|}<>~`"});
		return;
	}
	
	var containsProfanity = await filter.containsProfanity(username);
	if(containsProfanity) {
		res.send({error: "Username contains a bad word!\nIf this is a mistake, please contact an admin."});
		return;
	}
	var exists = await sql`select exists(select 1 from accounts where lower(username)=lower(${username}))`;

	if (exists[0].exists) {
		res.send({error: "Username already taken"});
		return;
	}

	bcrypt.hash(req.body.password, 10, (err, hash) => {
		if (err) {
			res.status(500).send({error:"Internal server error"});
			return;
		}
		var secret = uuid.v4();
		sql`insert into accounts(username, password, email, secret, skins, lastlogin) values(${username}, ${hash}, ${req.body.email}, ${secret}, ${JSON.stringify({collected: ["player"], selected: "player"})}, ${Date.now()})`;
		res.send({secret: secret});
	});



});

app.post("/api/login", async (req, res) => { 
	if(!req.body || req.body.password == undefined || req.body.username == undefined || req.body.captcha == undefined) {	
		res.send({error: "Missing fields"});
		return;
	}

	async function doit() {
	var username = req.body.username;
	var password = req.body.password;
	var account = await sql`select * from accounts where lower(username)=lower(${username})`;

	if(!account[0]) {
		res.send({error: "Invalid username"});
		return;
	}

	const match = await bcrypt.compare(password, account[0].password);
	if(!match) {
		res.send({error: "Invalid password"});
		return;
	}
	
	res.send(account[0]);
	}
	var send = {
		secret: process.env.CAPTCHASECRET,
		response: req.body.captcha,
		remoteip: req.headers["x-forwarded-for"] || req.socket.remoteAddress 
	};
	if(recaptcha) {
		axios
			.post(
				"https://www.google.com/recaptcha/api/siteverify?" +
	  new URLSearchParams(send)
			)
			.then(async (f) => {
				f = f.data;
				if (!f.success) {
					res.status(403).send("Captcha failed " +  f["error-codes"].toString());
					return;
				}
				if (f.score < 0.3) {
					res.status(403).send("Captcha score too low");
					return;
				}
				doit();
			});
	} else doit();


});

app.post("/api/loginsecret", async (req, res) => { 
	if(!req.body || !req.body.secret || req.body.captcha == undefined) {	
		res.send({error: "Missing secret or captcha"});
		return;
	}

	async function doit() {
	var secret = req.body.secret;
	
	var account = await sql`select * from accounts where secret=${secret}`;

	if(!account[0]) {
		res.send({error: "Invalid secret"});
		return;
	}

	res.send(account[0]);

	}
	var send = {
		secret: process.env.CAPTCHASECRET,
		response: req.body.captcha,
		remoteip: req.headers["x-forwarded-for"] || req.socket.remoteAddress 
	};
	if(recaptcha) {
		axios
			.post(
				"https://www.google.com/recaptcha/api/siteverify?" +
	  new URLSearchParams(send)
			)
			.then(async (f) => {
				f = f.data;
				if (!f.success) {
					res.status(403).send("Captcha failed " +  f["error-codes"].toString());
					return;
				}
				if (f.score < 0.3) {
					res.status(403).send("Captcha score too low");
					return;
				}
				doit();
			});
	} else doit();


});

app.get("/leaderboard", async (req, res) => {
	//SELECT * from games where EXTRACT(EPOCH FROM (now() - created_at)) < 86400 ORDER BY coins DESC LIMIT 10
 
	//var lb= await sql`SELECT * FROM games ORDER BY coins DESC LIMIT 13`;
	var type =["coins", "kills", "time","xp"].includes(req.query.type) ? req.query.type : "coins";
	var duration  = ["all", "day", "week","xp"].includes(req.query.duration) ? req.query.duration : "all";
	if(type !== "xp") {
	if(duration != "all") {
		var lb = await sql`SELECT * from games where EXTRACT(EPOCH FROM (now() - created_at)) < ${duration == "day" ? "86400" : "608400"} ORDER BY ${ sql(type) } DESC, created_at DESC LIMIT 23`;
	} else {
		var lb = await sql`SELECT * from games ORDER BY ${ sql(type) } DESC, created_at DESC LIMIT 23`;
	}
} else {
	if(duration != "all") {
		var lb = await sql`select name,(sum(coins)+(sum(kills)*100)) as xp from games where verified = true and EXTRACT(EPOCH FROM (now() - created_at)) < ${duration == "day" ? "86400" : "608400"} group by name order by xp desc limit 23`;
	} else {
		var lb = await sql`select name,(sum(coins)+(sum(kills)*100)) as xp from games where verified = true group by name order by xp desc limit 23`;
	}
	lb = lb.map(x => {
		x.verified = true;
		return x;
	});
}
	
	console.log(type, duration);
	res.render("leaderboard.ejs", {lb: lb, type: type, duration: duration});
});

app.get("/settings", async (req, res) => {
	res.send("I'm still working on this page.<br><br>For now, if you want to change password, or change your username, please email me at<br>gautamgxtv@gmail.com");
});

app.get("/:user", async (req, res, next) => {
	var user = req.params.user;
	var dbuser  = await sql`SELECT * from accounts where lower(username)=lower(${user})`;
	if(!dbuser[0]) {
		next();
	} else {
		var yo = await sql`SELECT * FROM games WHERE lower(name)=${user.toLowerCase()} AND verified='true';`;
		var stats = await sql`
		select a.dt,b.name,b.xp,b.kills from
		(
		select distinct(created_at::date) as Dt from games where created_at >= ${dbuser[0].created_at}::date-1 order by created_at::date 
		) a
		left join
		(
		  SELECT name,created_at::date as dt1,(sum(coins)+(sum(kills)*100)) as xp,sum(kills) as kills ,sum(coins) as coins,sum(time) as time FROM games WHERE verified='true' and lower(name)=${user.toLowerCase()} group by name,created_at::date
		) b on a.dt=b.dt1 order by a.dt asc
		`;
		var lb = await sql`select name,(sum(coins)+(sum(kills)*100)) as xp from games where verified = true group by name order by xp desc`;
		var lb2 = await sql`select name,(sum(coins)+(sum(kills)*100)) as xp from games where verified = true and EXTRACT(EPOCH FROM (now() - created_at)) < 86400 group by name order by xp desc`;
		res.render("user.ejs", {user: dbuser[0], games: yo, stats: stats, lb: lb, lb2: lb2});
		
	}
});


Object.filter = (obj, predicate) =>
	Object.keys(obj)
		.filter((key) => predicate(obj[key]))
		.reduce((res, key) => ((res[key] = obj[key]), res), {});

var coins = [];

var maxCoins = 200;
var maxAiPlayers = 10;

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

	socket.on("go", async (r, captchatoken, tryverify, options) => {
		async function ready() {
			var name;
			if(!tryverify) {
				try {
			name = await filter.clean(r.substring(0, 16));
				} catch(e) {
					name = r.substring(0, 16);
				}

			} else {
				var accounts = await sql`select * from accounts where secret=${r}`;
				if(!accounts[0]) {
					socket.emit("ban", "Invalid secret, please try logging out and relogging in");
					socket.disconnect();
					return;
				}
		var name = accounts[0].username;

			}

				var thePlayer = new Player(socket.id,  name);
				thePlayer.updateValues();
        if(options && options.hasOwnProperty("movementMode")) {
          thePlayer.movementMode = options.movementMode
        }
				

				if(tryverify) {
					thePlayer.verified = true;
					thePlayer.skin = accounts[0].skins.selected;
				}

				
				PlayerList.setPlayer(socket.id, thePlayer);
				console.log("player joined -> " + socket.id);
				socket.broadcast.emit("new", thePlayer);

				var allPlayers = Object.values(PlayerList.players);
				allPlayers = allPlayers.filter((player) => player.id != socket.id);

				if (allPlayers && allPlayers.length > 0) socket.emit("players", allPlayers);
				socket.emit("coins", coins);

				socket.joined = true;
        socket.emit("levels", levels);

		}
		if (!captchatoken && recaptcha) {
			socket.emit(
				"ban",
				"You were kicked for not sending a captchatoken. Send this message to gautamgxtv@gmail.com if you think this is a bug."
			);
			return socket.disconnect();
		}
		if (!r) {
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
		var thePlayer = PlayerList.getPlayer(socket.id);
		sql`INSERT INTO games (id, name, coins, kills, time, verified) VALUES (${thePlayer.id}, ${thePlayer.name}, ${thePlayer.coins}, ${thePlayer.kills}, ${Date.now() - thePlayer.joinTime}, ${thePlayer.verified})`;
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
