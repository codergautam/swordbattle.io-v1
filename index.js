const express = require("express");
const https = require("https");
var http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const app = express();
var emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
var uuid = require("uuid");
var fs = require("fs");
var process = require("process");

var serverState = "running";

var map = 10000;
//var cors = require("cors");

var server;
var httpsserver;

//console.log(fs.readFileSync("/etc/letsencrypt/live/test.swordbattle.io/fullchain.pem"))
var usinghttps = false;
if(process.env.PRODUCTION==="true") {
	usinghttps = true;
	var options = {
		key: fs.readFileSync("/etc/letsencrypt/live/us2.swordbattle.io/privkey.pem"),
		cert: fs.readFileSync("/etc/letsencrypt/live/us2.swordbattle.io/fullchain.pem"),
	};
 httpsserver = https.createServer(options, app).listen(443);
}
 server = http.createServer(app); 


//server = http.createServer(app);

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
const Chest = require("./classes/Chest");
const AiPlayer = require("./classes/AiPlayer");
const PlayerList = require("./classes/PlayerList");
const { sql } = require("./database");

const io = new Server(usinghttps?httpsserver:server, { cors: { origin: "*" }});
function getRandomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

var production = true;
if (production) {
	const rateLimit = require("express-rate-limit");
	const limiter = rateLimit({
		windowMs: 60 * 1000, // 1 min
		max: 500, // limit each IP to 500 requests per min
	});
	app.use(limiter);
}

var oldlevels = [
	{coins: 5, scale: 0.28},
	{coins: 15, scale: 0.32},
	{coins: 25, scale: 0.35},
	{coins: 35, scale: 0.4},
	{coins: 50, scale: 0.45},
	{coins: 75, scale: 0.47},
	{coins: 100, scale: 0.5},
	{coins: 200, scale: 0.7},
	{coins: 350, scale: 0.8},
	{coins: 500, scale: 0.85},
	{coins: 600, scale: 0.87},
	{coins: 750, scale: 0.89},
	{coins: 900, scale: 0.9},
	{coins: 1000, scale: 0.95},
	{coins: 1100, scale: 0.97},
	{coins: 1250, scale: 0.99},
	{coins: 1500, scale: 1},
	{coins: 2000, scale: 1.04},
	{coins: 2250, scale: 1.06},
	{coins: 2500, scale: 1.07},
	{coins: 2750, scale: 1.1},
	{coins: 3000, scale: 1.15},
	{coins: 5000, scale: 1.2},
	{coins: 10000, scale: 1.3},
	{coins: 20000, scale: 1.5},
	{coins: 25000, scale: 1.6},
	{coins: 30010, scale: 1.71},
	{coins: 30020, scale: 1.71},
	{coins: 30050, scale: 1.71},
];

app.set("trust proxy", true);

app.use((req, res, next) => {
	console.log("URL:", req.url);
	console.log("IP:", req.ip);
	next();
});

var levels = [];
oldlevels.forEach((level, index)  =>{
	if(index == 0) levels.push(Object.assign({start: 0},level)); 
	else {
		levels.push(Object.assign({start: levels[index - 1].coins}, level));
	}
});

moderation.start(app);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
});


app.use("/", express.static("dist"));
app.use("/assets", express.static("assets"));

app.post("/api/buy", async (req, res) => {

		//read cosmetics.json
	var cosmetics = JSON.parse(fs.readFileSync("./cosmetics.json"));

	//get user data
	var secret = req.body.secret;
	var item = req.body.item;


	if(!item || item == "undefined") {
		res.status(400).send("No item specified");
		return;
	}
	var item = cosmetics.skins.find(e=> e.name == item);
	if(!item) {
		res.status(400).send("Item not found");
		return;
	}

	var acc;
	if(secret && secret!="undefined") {
		var account = await sql`select skins,coins,username from accounts where secret=${secret}`;
		if(account[0]) {
			acc = account[0];
			var yo = await sql`SELECT sum(coins) FROM games WHERE lower(name)=${acc.username.toLowerCase()} AND verified='true';`;
			acc.bal = yo[0].sum + acc.coins;
			if(acc.skins.collected.includes(item.name)) {
				res.status(400).send("Skin already owned");
				return;
			}
			if(acc.bal < item.price) {
				res.status(406).send("Not enough coins");
				return;
			}

			var newbal = acc.coins - item.price;
			var newskins = acc.skins;
			newskins.collected.push(item.name);
			await sql`UPDATE accounts SET skins=${JSON.stringify(newskins)},coins=${newbal} WHERE secret=${secret}`;
			res.send("Success");
			return;

		} else {
			res.status(400).send("Invalid secret");
			return;
		}
	} else {
		res.status(400).send("No secret provided");
		return;
	}
});
app.post("/api/equip", async (req, res) => {

	//read cosmetics.json
var cosmetics = JSON.parse(fs.readFileSync("./cosmetics.json"));

//get user data
var secret = req.body.secret;
var item = req.body.item;


if(!item || item == "undefined") {
	res.status(400).send("No item specified");
	return;
}
var item = cosmetics.skins.find(e=> e.name == item);
if(!item) {
	res.status(400).send("Item not found");
	return;
}

var acc;
if(secret && secret!="undefined") {
	var account = await sql`select skins,coins,username from accounts where secret=${secret}`;
	if(account[0]) {
		acc = account[0];
		if(acc.skins.collected.includes(item.name)) {
			var newskins = acc.skins;
			newskins.selected = item.name;
			await sql`UPDATE accounts SET skins=${JSON.stringify(newskins)} WHERE secret=${secret}`;
			res.send("Success");
			return;
		
		} else {
			res.status(400).send("Item not owned");
			return;
		}
	} else {
		res.status(400).send("Invalid secret");
		return;
	}
} else {
	res.status(400).send("No secret provided");
	return;
}
});

app.post("/api/signup", async (req, res) => {
	if(typeof req.body!=="object" || typeof req.body.password !== "string" || typeof req.body.username !== "string") {	
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
	if(typeof req.body!=="object" || typeof req.body.password !== "string" || typeof req.body.username !== "string" || typeof req.body.captcha !== "string") {	
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
	}else doit();


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


app.get("/skins", async (req, res) => {
	res.redirect("/shop");
});

app.get("/shop", async (req, res) => {
	//read cosmetics.json
	var cosmetics = JSON.parse(fs.readFileSync("./cosmetics.json"));

	//get user data
	var secret = req.query.secret;
	var acc;
	if(secret!="undefined") {
		var account = await sql`select skins,coins,username from accounts where secret=${secret}`;
		if(account[0]) {
			acc = account[0];
			var yo = await sql`SELECT sum(coins) FROM games WHERE lower(name)=${acc.username.toLowerCase()} AND verified='true';`;
			acc.bal = yo[0].sum + acc.coins;
		}
	}

	res.render("shop.ejs", {cosmetics: cosmetics, account: acc, secret: secret});
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

		/*
		TODO

		SELECT A.dt,
		B.NAME,
		B.COINS
		FROM
		(
		SELECT distinct(DATE_ACTUAL) as dt FROM d_date
			WHERE DATE_ACTUAL>='2022-01-01'
		order by date_actual asc
		) A
		
		LEFT outer JOIN 
		(
		SELECT
		NAME,
		CREATED_AT::DATE AS PLAYED_DATE,
		sum(COINS) as coins
		FROM
		GAMES GMS
		WHERE VERIFIED=TRUE
		group by name,created_at::Date
		) B
		ON A.dt=B.PLAYED_DATE
		WHERE NAME='Dooku'
		ORDER BY A.dt ASC
	
*/


		var stats = await sql`
		select a.dt,b.name,b.xp,b.kills from
		(
		select distinct(created_at::date) as Dt from games where created_at >= ${dbuser[0].created_at}::date-1 
		order by created_at::date 
		) a
		left join
		(
		  SELECT name,created_at::date as dt1,(sum(coins)+(sum(kills)*100)) as xp,sum(kills) as kills ,sum(coins) as coins,
		  sum(time) as time FROM games WHERE verified='true' and lower(name)=${user.toLowerCase()} group by name,created_at::date
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
var chests = [];

var maxCoins = 500;
var maxChests = 10;
var maxAiPlayers = 10;
var maxPlayers = 50;

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
          thePlayer.movementMode = options.movementMode;
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
				socket.emit("chests", chests);

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
		//console.log(Object.values(PlayerList.players).length);
		if (Object.values(PlayerList.players).length >= maxPlayers) {
			socket.emit("ban", "Server is full. Please try again later.");
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
			[coins,chests] = player.down(down, coins, io, chests);
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
	socket.on("chat", (msg) => {
		msg = msg.trim().replace(/\\/g, "\\\\");
		if (msg.length > 0) {
			if (msg.length > 35) msg = msg.substring(0, 35);
			if (!PlayerList.has(socket.id) || Date.now() - PlayerList.getPlayer(socket.id).lastChat < 1000) return;
			var p = PlayerList.getPlayer(socket.id);
			p.lastChat = Date.now();
			PlayerList.setPlayer(socket.id, p);
			filter.clean(msg).then((msg) => {
				io.sockets.emit("chat", {
					msg: msg,
					id: socket.id,
				});
			});
		}
	});
	function clamp(num, min, max) {
		return num <= min ? min : num >= max ? max : num;
	}
	socket.on("disconnect", () => {
		if(serverState == "exiting") return;
		if (!PlayerList.has(socket.id)) return;
		var thePlayer = PlayerList.getPlayer(socket.id);

              //drop their coins
              var drop = [];
              var dropAmount = clamp(Math.round(thePlayer.coins*0.8), 10, 20000);
              var dropped = 0;
              while (dropped < dropAmount) {
                var r = thePlayer.radius * thePlayer.scale * Math.sqrt(Math.random());
                var theta = Math.random() * 2 * Math.PI;
                var x = thePlayer.pos.x + r * Math.cos(theta);
                var y = thePlayer.pos.y + r * Math.sin(theta);
                var remaining = dropAmount - dropped;
                var value = remaining > 50 ? 50 : (remaining > 10 ? 10 : (remaining > 5 ? 5 : 1));

                coins.push(
                  new Coin({
                    x: clamp(x, -(map/2), map/2),
                    y: clamp(y, -(map/2), map/2),
                  },value)
                );
                dropped += value;
                drop.push(coins[coins.length - 1]);
              }

                io.sockets.emit("coin", drop, [thePlayer.pos.x, thePlayer.pos.y]);
              

		sql`INSERT INTO games (name, coins, kills, time, verified) VALUES (${thePlayer.name}, ${thePlayer.coins}, ${thePlayer.kills}, ${Date.now() - thePlayer.joinTime}, ${thePlayer.verified})`;

		PlayerList.deletePlayer(socket.id);
		socket.broadcast.emit("playerLeave", socket.id);
	});
});

//tick
var secondStart = Date.now();
var lastCoinSend = Date.now();
var tps = 0;
var actps = 0;
app.get("/api/serverinfo", (req, res) => {
	var playerCount = Object.values(PlayerList.players).length;
	var lag = (actps > 15 ? "No lag" : actps > 6 ? "Moderate lag" : "Extreme lag" );
	res.send({
		playerCount, lag, maxPlayers, tps: actps, actualPlayercount: Object.values(PlayerList.players).filter((p) => !p.ai).length,
	});
});

setInterval(async () => {
	//const used = process.memoryUsage().heapUsed / 1024 / 1024;
//console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
	PlayerList.clean();
	moderation.io = io;
	if (coins.length < maxCoins) {
		coins.push(new Coin());
		io.sockets.emit("coin", coins[coins.length - 1]);
	}
	if(chests.length < maxChests) {
		chests.push(new Chest());
		io.sockets.emit("chest", chests[chests.length - 1]);
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
		actps = tps;
		//console.log("Players: "+Object.keys(players).length+"\nTPS: "+tps+"\n")
		secondStart = Date.now();
		tps = 0;
	}
	if (Date.now() - lastCoinSend >= 10000) {
		io.sockets.emit("coins", coins);
		io.sockets.emit("chests", chests);

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
				[coins,chests] = player.tick(coins, io, levels, chests);
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
}, 1000 / 20);

server.listen(process.env.PORT || 3000, () => {
	console.log("server started");
});


process.on("SIGTERM", () => {
	cleanExit().then(() => {
		console.log("exited cleanly");
		process.exit(1);
	}).catch(() => {
		console.log("failed to exit cleanly");
		process.exit(1);
	});
});
process.on("SIGINT", () => {
	cleanExit().then(() => {
		console.log("exited cleanly");
		process.exit(1);
	}).catch(() => {
		console.log("failed to exit cleanly");
		process.exit(1);
	});
});
//unhandledRejection
process.on("unhandledRejection", (reason, p) => {
	console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
	cleanExit().then(() => {
		console.log("exited cleanly");
		process.exit(1);
	}).catch(() => {
		console.log("failed to exit cleanly");
		process.exit(1);
	});
});

async function cleanExit() {
	console.log("exiting cleanly...");
	serverState = "exiting";

	var sockets = await io.fetchSockets();

		for (var player of Object.values(PlayerList.players)) {
		if (player && !player.ai) {
			var socket = sockets.find((s) => s.id == player.id);
			if (socket) {
				socket.emit("ban", "<h1>Server is shutting down, we'll be right back!<br>Sorry for the inconvenience.<br><br>"+(player.verified ? " Your Progress has been saved in your account":"")+"</h1><hr>");
				socket.disconnect();
			await sql`INSERT INTO games (name, coins, kills, time, verified) VALUES (${player.name}, ${player.coins}, ${player.kills}, ${Date.now() - player.joinTime}, ${player.verified})`;
	
		}
		}
	};
}

/*
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers["host"] + req.url });
    res.end();
}).listen(80);
*/
