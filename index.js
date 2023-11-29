/*
                           _ _           _   _   _        _
 _____      _____  _ __ __| | |__   __ _| |_| |_| | ___  (_) ___
/ __\ \ /\ / / _ \| '__/ _` | '_ \ / _` | __| __| |/ _ \ | |/ _ \
\__ \\ V  V / (_) | | | (_| | |_) | (_| | |_| |_| |  __/_| | (_) |
|___/ \_/\_/ \___/|_|  \__,_|_.__/ \__,_|\__|\__|_|\___(_)_|\___/
A game by Gautam
*/


const { execSync } = require("child_process");
let commit;
try {
  commit = execSync("git rev-parse HEAD").toString().trim();
} catch (e) {
  commit = "unknown";
}
console.log("\x1b[32mSwordbattle.io\x1b[0m server starting up... \nRunning \x1b[33m" + commit.slice(0, 7) + "\x1b[0m!");
const express = require("express");
const https = require("https");
var http = require("http");
require("dotenv").config();
const app = express();
var emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
var uuid = require("uuid");
var fs = require("fs");
var process = require("process");

const Filtery = require("purgomalum-swear-filter");
const filtery = new Filtery();

var ipInfo = require("ip-info-finder");

var usewebhook = false;
var useDb = process.env.DATABASE_URL ? true : false;
const dbText = "Database not connected. Enable your database using this tutorial: https://iogames.forum/t/integrating-database-to-swordbattle-v1-code/13458"
console.log(useDb ? "Using database" : "Not using database");
if(process.env.hasOwnProperty("WEBHOOK_URL")) usewebhook = true;

var Hook;
if(usewebhook) {
const webhook = require("webhook-discord");
Hook = new webhook.Webhook(process.env.WEBHOOK_URL);
Hook.custom = async (username, message) => {
  const msg = new webhook.MessageBuilder()
  .setName(username)
  .setText("<@875067761557127178>"+(process.env.SERVER == "USA" ? "<@942438729560252477>\n" : "\n")+message);
return Hook.send(msg);
};
Hook.success(process.env.SERVER, "Server started");
}
var serverState = "running";

var map = 15000;
//var cors = require("cors");

var server;
var httpsserver;


//console.log(fs.readFileSync("/etc/letsencrypt/live/test.swordbattle.io/fullchain.pem"))
var usinghttps = false;
if (process.env.USEFISHYSSL === "true") {
  usinghttps = true;
  var options = {
    key: fs.readFileSync(
      process.env.PRIVKEYPATH
    ),
    cert: fs.readFileSync(
      process.env.FULLCHAINPATH
    ),
  };
  httpsserver = https.createServer(options, app).listen(443);
}
server = http.createServer(app);

const ws = require("ws");
const wss = new ws.Server({ server: usinghttps ? httpsserver : server });
//server = http.createServer(app);


const axios = require("axios").default;
var filter = require("leo-profanity");
const moderation = require("./moderation");
const { v4: uuidv4 } = require("uuid");
 var {recaptcha, localServer} = require("./config.json");



recaptcha = true;

var passwordValidator = require("password-validator");
var schema = new passwordValidator();
app.use(express.json());
app.disable("x-powered-by"); //Disable powered by header to prevent vulnerability scans against swordbattle.
// Add properties to it
schema
  .is()
  .min(5, "Password has to be at least 5 chars") // Minimum length 5
  .is()
  .max(20, "Password cant be longer than 20 chars") // Maximum length 20
  .has()
  .not()
  .spaces(undefined, "Password cant contain spaces"); // Should not have spaces

const Player = require("./classes/Player");
const Coin = require("./classes/Coin");
const Chest = require("./classes/Chest");
const AiPlayer = require("./classes/AiPlayer");
const PlayerList = require("./classes/PlayerList");
const { sql } = require("./database");
const { config } = require("dotenv");



const checkifMissingFields = (req,res,next) => {
if(typeof req.body!=="object" || typeof req.body.password !== "string" || typeof req.body.username !== "string" || typeof req.body.captcha !== "string") {
		res.send({error: "Missing fields"});
		return;
}
next();
};

const WsMapper = require("./classes/WsMapper");
const io = new WsMapper(wss);

const evolutions = require("./classes/evolutions");
const { lineCircle } = require("intersects");
const { lineBox } = require("intersects");

function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

var production = process.env.PRODUCTION == "true";
const rateLimit = require("express-rate-limit");

if (production) {
	const limiter = rateLimit({
		windowMs: 60 * 1000, // 1 min
		max: 1000, // limit each IP to 1000 requests per min
		message: "Too many requests from this IP address, please try again later." //Add message when rate-limit
	});
	app.use(limiter);
}

let xplb = null;
var content = [];

(async () => {
  if(useDb) content = await sql`SELECT * FROM public.content`;
})();

var oldlevels = [
	{coins: 5, scale: 0.85},
	{coins: 15, scale: 0.86},
	{coins: 25, scale: 0.87},
	{coins: 35, scale: 0.88},
	{coins: 50, scale: 0.89},
	{coins: 75, scale: 0.90},
	{coins: 100, scale: 0.91},
	{coins: 200, scale: 0.92},
	{coins: 350, scale: 0.93},
	{coins: 500, scale: 0.94},
	{coins: 600, scale: 0.95},
	{coins: 750, scale: 0.96},
	{coins: 900, scale: 0.97},
	{coins: 1000, scale: 0.98},
	{coins: 1250, scale: 0.99},
	{coins: 1500, scale: 1},
	{coins: 2000, scale: 1.04},
	{coins: 2250, scale: 1.06},
	{coins: 2500, scale: 1.07},
	{coins: 2750, scale: 1.1},
	{coins: 3000, scale: 1.15},
  {coins: 4000, scale: 1.17},
	{coins: 5000, scale: 1.2, evolutions: [evolutions.tank, evolutions.berserker]},
	{coins: 7500, scale: 1.3},
	{coins: 9000, scale: 1.5},
	{coins: 10000, scale: 1.53},
  {coins: 15000, scale: 1.55},
  {coins: 20000, scale: 1.56},
  {coins: 25000, scale: 1.57},
  {coins: 30000, scale: 1.58},
  {coins: 40000, scale: 1.59},
  {coins: 50000, scale: 1.62},
  {coins: 60000, scale: 1.63},
  {coins: 100000, scale: 1.7},
  {coins: 200000, scale: 1.8},
  {coins: 300000, scale: 1.9},
  {coins: 400000, scale: 2},
  {coins: 500000, scale: 2.5},
];
app.set("trust proxy", true);
/*
app.use((req, res, next) => {
  console.log("URL:", req.url);
  console.log("IP:", req.ip);
  next();
});*/

app.all("*", (req, res, next) => {
  // ban IPs
  // get ip from headers first
  try {
  const ip = req.headers["x-forwarded-for"].split(",")[0];
 // console.log("IP", ip);
  req.ip = ip;
  // if ip is in ban list, send 403
  if (moderation.bannedIps.includes(ip)) {
    res.status(403).send("You are banned, contact gautam@swordbattle.io for appeal<br>Have a terrible day :)");
    return;
  } else next();
} catch (e) {
  // console.log(e);
  next();
}

});

var levels = [];
oldlevels.forEach((level, index)  =>{
	if(index == 0) {
		levels.push(Object.assign({start: 0, num:index+1},level));
	}
	else {
		levels.push(Object.assign({start: levels[index - 1].coins, num:index+1}, level));
	}
});

moderation.start(app, io);

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use("/", express.static("dist"));
app.use("/", express.static("public"));

app.get("/", (req, res) => {
  res.send("Please build the client first<br/>Run npm run build");
});

app.use("/assets", express.static("assets"));

app.post("/api/buy", async (req, res) => {
  //read cosmetics.json
  if(!useDb) return res.status(500).send(dbText);
  var cosmetics = JSON.parse(fs.readFileSync("./cosmetics.json"));

  //get user data
  var secret = req.body.secret;
  var item = req.body.item;

  if (!item || item == "undefined") {
    res.status(400).send("No item specified");
    return;
  }
  var item = cosmetics.skins.find((e) => e.name == item);
  if (!item) {
    res.status(400).send("Item not found");
    return;
  }

  var acc;
  if (secret && secret != "undefined") {
    var account =
      await sql`select skins,coins,username from accounts where secret=${secret}`;
    if (account[0]) {
      acc = account[0];
      if(typeof acc.skins == "string") acc.skins = JSON.parse(acc.skins);
      var yo =
        await sql`SELECT sum(coins) FROM stats WHERE lower(username)=${acc.username.toLowerCase()}`;
      acc.bal = yo[0].sum + acc.coins;
      if (acc.skins.collected.includes(item.name)) {
        res.status(400).send("Skin already owned");
        return;
      }
      if (acc.bal < item.price) {
        res.status(406).send("Not enough coins");
        return;
      }

      var newbal = acc.coins - item.price;
      var newskins = acc.skins;
      newskins.collected.push(item.name);
      await sql`UPDATE accounts SET skins=${JSON.stringify(
        newskins
      )},coins=${newbal} WHERE secret=${secret}`;
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
  if(!useDb) return res.status(500).send(dbText);
  var cosmetics = JSON.parse(fs.readFileSync("./cosmetics.json"));

  //get user data
  var secret = req.body.secret;
  var item = req.body.item;

  if (!item || item == "undefined") {
    res.status(400).send("No item specified");
    return;
  }
  var item = cosmetics.skins.find((e) => e.name == item);
  if (!item) {
    res.status(400).send("Item not found");
    return;
  }

  var acc;
  if (secret && secret != "undefined") {
    var account =
      await sql`select skins,coins,username from accounts where secret=${secret}`;
    if (account[0]) {
      acc = account[0];
      if(typeof acc.skins == "string") acc.skins = JSON.parse(acc.skins);
      if (acc.skins.collected.includes(item.name)) {
        var newskins = acc.skins;
        newskins.selected = item.name;
        await sql`UPDATE accounts SET skins=${JSON.stringify(
          newskins
        )} WHERE secret=${secret}`;
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

app.post("/api/changepassword", async (req,res) => {
  if(!useDb) return res.status(500).send(dbText);
  if(typeof req.body !== "object" || typeof req.body.secret !== "string" || typeof req.body.oldPass !== "string" || typeof req.body.newPass !== "string") {
    res.status(400).send({error: "Missing fields"});
		return;
  }
  var secret = req.body.secret;
  if(!schema.validate(req.body.newPass)) {
		res.send({error:schema.validate(req.body.newPass, { details: true })[0].message});
		return;
	}
  var account = await sql`SELECT password, secret FROM accounts WHERE secret=${secret}`;
  if(!account[0]) {
    res.status(400).status(400).send({error: "Invalid secret"});
    return;
  };

  oldPassHash = account[0].password;
  match = await bcrypt.compare(req.body.oldPass, oldPassHash);
  if (!match){
    res.send({error: "Invalid password"});
		return;
  };

  newSecret = uuid.v4();
  newAccount = await sql`UPDATE accounts SET password=${bcrypt.hashSync(req.body.newPass, 10)}, secret=${newSecret} WHERE secret=${req.body.secret}`;
  res.send({"Success": true, "secret": newSecret});
});

app.post("/api/changename", async (req,res) => {
  if(!useDb) return res.status(500).send(dbText);
	if(typeof req.body!=="object" || typeof req.body.secret !== "string" || typeof req.body.username !== "string") {
		res.status(400).send({error: "Missing fields"});
		return;
	}

  //check if secret valid
  var secret = req.body.secret;
  var newUsername = req.body.username;
  var account = await sql`select username from accounts where secret=${secret}`;
  if(!account[0]) {
    res.status(400).status(400).send({error: "Invalid secret"});
    return;
  }
  var oldUsername = account[0].username;
  var oldUsernameLower = oldUsername.toLowerCase();
  if(oldUsername == newUsername) {
    res.status(400).send({error: "You already have this username!"});
    return;
  }
  //check if new username valid

  if(newUsername.length >= 20) {
		res.status(400).send({error: "Username has to be shorter than 20 characters"});
		return;
	}
	if(newUsername.charAt(0) == " " || newUsername.charAt(newUsername.length - 1) == " ") {
		res.status(400).send({error: "Username can't start or end with a space"});
		return;
	}
	if(newUsername.includes("  ")) {
		res.status(400).send({error: "Username can't have two spaces in a row"});
		return;
	}
	var regex = /^[a-zA-Z0-9!@"$%&:';()*\+,;\-=[\]\^_{|}<>~` ]+$/g;
	if(!newUsername.match(regex)) {
		res.status(400).send({error: "Username can only contain letters, numbers, spaces, and the following symbols: !@\"$%&:';()*\+,-=[\]\^_{|}<>~`"});
		return;
	}

	var containsProfanity = filter.check(newUsername);
	if(containsProfanity) {
		res.status(400).send({error: "Username contains a bad word!\nIf this is a mistake, please contact an admin."});
		return;
	}

  try {
  var containsProfanity2 = await filtery.containsProfanity(newUsername);
  if(containsProfanity2) {
    res.status(400).send({error: "Username contains a bad word!\nIf this is a mistake, please contact an admin."});
    return;
  }
  } catch(e) {
    console.log(e);
  }

  //get days since lastchange
  var daysSince = await sql`select (now()::date - lastusernamechange::date) as days from accounts where secret=${secret}`;

  if(daysSince[0].days !== null && daysSince[0].days < 7) {
    res.status(400).send({error: `You can change your username again in ${7-daysSince[0].days} days`});
    return;
  }



  //check if new username exists
  var account1 = await sql`select username from accounts where lower(username)=${newUsername.toLowerCase()}`;
  if(account1[0]) {
    res.status(400).send({error: "Username already taken"});
    return;
  }

  //update username
  await sql`UPDATE accounts SET username=${newUsername}, lastusernamechange=now() WHERE secret=${secret}`;
  //update username in games
  await sql`UPDATE games SET name=${newUsername} WHERE lower(name)=${oldUsernameLower} AND verified=true`;
  //update username in stats
  await sql`UPDATE stats SET username=${newUsername} WHERE lower(username)=${oldUsernameLower}`;

  res.status(200).send("Success");

});

app.post("/api/signup",checkifMissingFields, async (req, res) => {
  if(!useDb) return res.status(500).send(dbText);

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
	if(username.length >= 20) {
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

	var containsProfanity = filter.check(username);
	if(containsProfanity) {
		res.send({error: "Username contains a bad word!\nIf this is a mistake, please contact an admin."});
		return;
	}


  try {
  var containsProfanity2 = await filtery.containsProfanity(username);
	if(containsProfanity2) {
		res.send({error: "Username contains a bad word!\nIf this is a mistake, please contact an admin."});
		return;
	}
} catch(e) {
  console.log(e);
}
	var exists = await sql`select exists(select 1 from accounts where lower(username)=lower(${username}))`;

	if (exists[0].exists) {
		res.send({error: "Username already taken"});
		return;
	}

 async function doit() {
	bcrypt.hash(req.body.password, 10, (err, hash) => {
		if (err) {
			res.status(500).send({error:"Internal server error"});
			return;
		}
		var secret = uuid.v4();
		sql`insert into accounts(username, password, email, secret, skins, lastlogin) values(${username}, ${hash}, ${req.body.email}, ${secret}, ${JSON.stringify({collected: ["player"], selected: "player"})}, ${Date.now()})`;
		res.send({secret: secret});
	});
 }

 var send = {
  secret: process.env.CAPTCHASECRET,
  response: req.body.captcha,
  remoteip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress
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
        res.status(403).send({error: "Captcha failed " +  f["error-codes"].toString()});
        return;
      }
      if (f.score < 0.3) {
        res.status(403).send({error: "Captcha score too low"});
        return;
      }
      doit();
    });
}else doit();



});

app.post("/api/login",checkifMissingFields, async (req, res) => {
  if(!useDb) return res.status(500).send(dbText);



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
		remoteip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress
	};
  console.log(send);
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
  if(!useDb) return res.status(500).send(dbText);

  if (!req.body || !req.body.secret || req.body.captcha == undefined) {
    res.send({ error: "Missing secret or captcha" });
    return;
  }

  async function doit() {
    var secret = req.body.secret;

    var account = await sql`select * from accounts where secret=${secret}`;

    if (!account[0]) {
      res.send({ error: "Invalid secret" });
      return;
    }

    res.send(account[0]);
  }
  var send = {
    secret: process.env.CAPTCHASECRET,
    response: req.body.captcha,
    remoteip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  };
  if (recaptcha) {
    axios
      .post(
        "https://www.google.com/recaptcha/api/siteverify?" +
          new URLSearchParams(send)
      )
      .then(async (f) => {
        f = f.data;
        if (!f.success) {
          res.status(403).send("Captcha failed " + f["error-codes"].toString());
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
  if(!useDb) return res.status(500).send(dbText);

  res.redirect("/shop");
});
app.get("/api/getFeaturedContent", (req,res) => {
  if(!useDb) return res.status(500).send(dbText);

  function getRandomContent(arr, numItems = 3) {
    // Create an array that considers the "chance" property
    const weightedArray = [];
    for (const item of arr) {
      for (let i = 0; i < item.chance; i++) {
        weightedArray.push(item);
      }
    }

    // Shuffle the array to make the selection random
    const shuffledArray = weightedArray.sort(() => 0.5 - Math.random());

    // Select the specified number of unique items
    const result = [];
    const seen = new Set();
    for (const item of shuffledArray) {
      if (!seen.has(item.id) && result.length < numItems) {
        result.push(item);
        seen.add(item.id);
      }
    }

    return result;
  }

  let out = getRandomContent(content);
  // Sort the array by chance being higher (if they are same, then sort by created_at most recent)
  out.sort((a, b) => {
    // console.log(b.title, new Date(b.created_at), " - ", a.title, new Date(a.created_at), " = ", new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });


  res.send(out);
});

app.get("/shop", async (req, res) => {
  if(!useDb) return res.status(500).send(dbText);

  //read cosmetics.json
  var cosmetics = JSON.parse(fs.readFileSync("./cosmetics.json"));

  //get user data
  var secret = req.query.secret;
  var acc;

  let counts = {};

if (secret != "undefined") {
    var account =
      await sql`select skins,coins,username from accounts where secret=${secret}`;
    if (account[0]) {
      acc = account[0];
      if(typeof acc.skins == "string") acc.skins = JSON.parse(acc.skins);
      var yo = await sql`SELECT sum(coins) FROM stats WHERE lower(username)=${acc.username.toLowerCase()}`;

      var skinStats = await sql`SELECT skins->'collected' as collected from accounts;`;
      skinStats.forEach((x) => {
        if(x?.collected) {
        x.collected.forEach((y) => {
          if (counts[y]) counts[y]++;
          else counts[y] = 1;
        });
        }
      });

      acc.bal = yo[0].sum + acc.coins;
    }
  }

  res.render("shop.ejs", {
    cosmetics: cosmetics,
    account: acc,
    secret: secret,
    counts
  });
});

app.get("/leaderboard", async (req, res) => {
  if(!useDb) return res.status(500).send(dbText);


  var type = ["coins", "kills", "time", "xp","totalstabs","totaltime","totalcoins"].includes(req.query.type)
    ? req.query.type
    : "xp";

  var duration = ["all", "day", "week", "xp"].includes(req.query.duration)
    ? req.query.duration
    : "all";
  if (type !== "xp" && !type.startsWith("total")) {

    if (duration != "all") {
      var lb =
        await sql`SELECT *, name as username from games where EXTRACT(EPOCH FROM (now() - created_at)) < ${
          duration == "day" ? "86400" : "608400"
        } ORDER BY ${sql(type)} DESC, created_at DESC LIMIT 103`;
    } else {
      var lb = await sql`SELECT *, name as username from games ORDER BY ${sql(
        type
      )} DESC, created_at DESC LIMIT 103`;
    }
  } else {

    if (duration != "all") {
      if(type == "xp"){
        // await sql`select name,(sum(coins)+(sum(kills)*300)) as xp from games where verified = true and EXTRACT(EPOCH FROM (now() - created_at)) < ${
        //   duration == "day" ? "86400" : "608400"
        // } group by name order by xp desc limit 103`;
        var lb;
        if(duration == "day") {
         lb = await sql`select username, (sum(coins)+(sum(stabs)*300)) as xp from stats where game_date>current_date-1 group by username order by xp desc limit 103`;

        } else {
          // week
           lb = await sql`select username, (sum(coins)+(sum(stabs)*300)) as xp from stats where game_date>current_date-7 group by username order by xp desc limit 103`;

        }
      }else{
  if(type == "totaltime") type = "totalgame_time";

        // var lb =
        // await sql`select name,sum(${sql(type.slice(5))}) as ${sql(type.slice(5))} from games where verified = true and EXTRACT(EPOCH FROM (now() - created_at)) < ${
        //   duration == "day" ? "86400" : "608400"
        // } group by name order by ${sql(type.slice(5))} desc limit 103`;
        var lb;
        if(duration == "day") {
           lb =
          await sql`select username,sum(${sql(type.slice(5))}) as ${sql(type.slice(5))} from stats where game_date>current_date-1 group by username order by ${sql(type.slice(5))} desc limit 103`;
         } else {
            // week
               lb =
              await sql`select username,sum(${sql(type.slice(5))}) as ${sql(type.slice(5))} from stats where game_date>current_date-7 group by username order by ${sql(type.slice(5))} desc limit 103`;

          }
      }
    } else {
  if(type == "time") type = "game_time";
  if(type == "totaltime") type = "totalgame_time";


      if (type == "xp") {
        if(!xplb) {
        xplb = xplb = await sql`
        SELECT username, (SUM(coins) + SUM(stabs) * 300) AS xp
  FROM public.stats
  GROUP BY username
  ORDER BY xp DESC;`;
        }
      var lb = xplb.slice(0, 103);
      } else {
        var lb =
        await sql`SELECT username, (SUM(${sql(type.slice(5))})) AS ${sql(type.slice(5))}
        FROM public.stats
        GROUP BY username
        ORDER BY ${sql(type.slice(5))} DESC
        LIMIT 103;`;
      }
      }
    lb = lb.map((x) => {
      x.verified = true;
      return x;
    });
  }

  if(type == "totalgame_time") type = "totaltime";
  if(type == "game_time") type = "time";

  res.render("leaderboard.ejs", { lb: lb, type: type, duration: duration });
});

app.get("/settings", async (req, res) => {
  res.send(
    "I'm still working on this page.<br><br>For now, if you want to change password, or change your username, please email<br>support@swordbattle.io"
  );
});


let ipusers = {};
let ips = {};
app.get("/:user", async (req, res, next) => {
  if(!useDb) return res.status(500).send(dbText);

  //console.log("IP: " + req.ip + " is looking at " + req.params.user);
  if (!ipusers[req.params.user.toLowerCase()]) {
    ipusers[req.params.user.toLowerCase()] = [];
  }

  if(!ips[req.ip]) {
    ips[req.ip] = {
      time: Date.now(),
      count: 0
    };
  }

	  if(Date.now() - ips[req.ip].time > 30000) {
    ips[req.ip].time = Date.now();
    ips[req.ip].count = 0;
  }
  if(ips[req.ip].count > 5) {
    res.send("The server is currently under heavy load. Please refresh in a few seconds to load this profile.");
    return;
  }



  var user = req.params.user;
  var dbuser =
    await sql`SELECT * from accounts where lower(username)=lower(${user})`;
  if (!dbuser[0]) {
    next();
  } else {

    ips[req.ip].count++;

    var yo =
      await sql`SELECT * FROM stats WHERE lower(username)=${user.toLowerCase()}`;

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

var stats = await sql`SELECT a.dt::date as dt, COALESCE(b.name, ${user.toLowerCase()}) as name, COALESCE(b.xp, 0) as xp, COALESCE(b.kills, 0) as kills, COALESCE(b.coins, 0) as coins, COALESCE(b.time, 0) as time
FROM (
  SELECT DISTINCT (generate_series(MIN(game_date), CURRENT_DATE, '1 day')) AS dt
  FROM public.stats
  WHERE lower(username) = ${user.toLowerCase()}
) a
LEFT JOIN (
  SELECT game_date AS dt1, username AS name, (SUM(coins) + (SUM(stabs) * 300)) AS xp, SUM(stabs) AS kills, SUM(coins) AS coins, SUM(game_time) AS time
  FROM public.stats
  WHERE lower(username) = ${user.toLowerCase()}
  GROUP BY game_date, username
) b ON a.dt = b.dt1
ORDER BY a.dt ASC;
`;
    var lb = xplb;
    var lb2 =
      await sql`select username,(sum(coins)+(sum(stabs)*300)) as xp from stats where game_date>current_date-1 group by username order by xp desc`;

      if (!ipusers[req.params.user.toLowerCase()].includes(req.ip)) {
        ipusers[req.params.user.toLowerCase()].push(req.ip);
      await sql`UPDATE accounts SET views=views+1 WHERE lower(username)=${user.toLowerCase()}`;

      dbuser[0].views++;
      }

      if(typeof user.skins == "string") user.skins = JSON.parse(user.skins);
      res.render("user.ejs", {
      user: dbuser[0],
      games: yo,
      stats: stats,
      lb: lb,
      lb2: lb2,
      cosmetics: JSON.parse(fs.readFileSync("./cosmetics.json"))
    });


  }
});


Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter((key) => predicate(obj[key]))
    .reduce((res, key) => ((res[key] = obj[key]), res), {});

var coins = [];
var chests = [];
var flyingSwords = [];

var maxCoins = 2500;

var maxChests = 22;
var maxUncommonChests = 11;
var maxRareChests = 7;
var maxEpicChests = 4;
var maxLegendaryChests = 2;
var maxMythicalChests = 1;

var maxAiPlayers = 20;
var maxPlayers = 100;


io.on("connection", async (socket) => {
  socket.joinTime = Date.now();

  if (moderation.bannedIps.includes(socket.ip)) {
    socket.send(
      "ban",
      "You are banned. Appeal to appeals@swordbattle.io<br><br>BANNED IP: " +
        socket.ip
    );
    socket.disconnect();
  }

  socket.on("pong", () => {
    socket.lastSuccessfullPing = Date.now();
    socket.ping = Date.now() - socket.lastPinged;
    socket.pong = true;
  });

  socket.on("go", async ([r, captchatoken, tryverify, options]) => {
    async function ready() {
      var name;
      if (!tryverify) {
        console.log("verifying", r);
        try {
          name = filter.clean(r.substring(0, 16));
        } catch (e) {
          name = r.substring(0, 16);
        }
        try {
          name = await filtery.clean(name);
        } catch(e) {
          name = name;
        }
      } else {
        if(!useDb) return socket.send("ban",dbText);
        var accounts = await sql`select * from accounts where secret=${r}`;
        if (!accounts[0]) {
          socket.send(
            "ban",
            "Invalid secret, please try logging out and relogging in"
          );
          socket.disconnect();
          return;
        }
        var name = accounts[0].username;
        if(Object.values(PlayerList.players).find((p)=>p.verified&&p.name.toLowerCase()==name.toLowerCase())) {
          socket.send("ban","<br/><h1>You are already playing on another device</h1>");
          socket.disconnect();
          return;
        }



      }


      var thePlayer = new Player(socket.id, name);
      thePlayer.updateValues();
      if (options && options.hasOwnProperty("movementMode")) {
        thePlayer.movementMode = options.movementMode;
      }


				if(tryverify) {
					thePlayer.verified = true;
					thePlayer.skin = accounts[0].skins.selected;

          var rt = xplb.findIndex((x) => x.username == name) + 1;
          if(rt <= 100) {
            thePlayer.ranking = rt;
          }
				}


				PlayerList.setPlayer(socket.id, thePlayer);
				console.log("player joined -> " + socket.id);
				socket.broadcast.send("new", thePlayer.getSendObj());

        if(options.country) {
          if(tryverify && accounts[0].country) {
            thePlayer.country = accounts[0].country;
          } else {
            // use ip
            ipInfo.getIPInfo(socket.ip).then((res) => {
              if(res?.CountryInfo?.code) {
                thePlayer.country = res.CountryInfo.code;
                console.log("country",res.CountryInfo.code);
              }
            }).catch((e) => {
              console.log(e);
            });
          }
        }

        // thePlayer.country = "IN";

				var allPlayers = Object.values(PlayerList.players);
				allPlayers = allPlayers.filter((player) => player.id != socket.id);

				if (allPlayers && allPlayers.length > 0) socket.send("players", allPlayers);
				socket.send("coins", coins.filter((coin) => coin.inRange(thePlayer)));
				socket.send("chests", chests);

				socket.joined = true;
        socket.send("levels", levels);

		}
		if (!captchatoken && recaptcha) {
			socket.send(
				"ban",
				"You were kicked for not sending a captchatoken. Send this message to bugs@swordbattle.io if you think this is a bug."
			);
			return socket.disconnect();
		}
		if (!r) {
			socket.send("ban", "You were kicked for not sending a name. ");
			return socket.disconnect();
		}
		if (PlayerList.has(socket.id)) {
			socket.send(
				"ban",
				"You were kicked for 2 players on 1 id. Send this message to support@swordbattle.io<br> In the meantime, try restarting your computer if this happens a lot. "
			);
			return socket.disconnect();
		}
		//console.log(Object.values(PlayerList.players).length);
		if (Object.values(PlayerList.players).length >= maxPlayers) {
			socket.send("ban", "Server is full. Please try again later.");
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
						socket.send(
							"ban",
							"Error while verifying captcha<br>" + f["error-codes"].toString()
						);
						socket.disconnect();
						return;
					}
					if (f.score < 0.3) {
						socket.send(
							"ban",
							`Captcha score too low: ${f.score}<br><br>If you're using a vpn, disable it. <br>If your on incognito, go onto a normal window<br>If your not signed in to a google account, sign in<br><br>If none of these worked, contact support@swordbattle.io`
						);
						socket.disconnect();
						return;
					}
					ready();
				});
		} else ready();
	});

  socket.on("evolve", (eclass) => {
    if(!PlayerList.has(socket.id)) return socket.send("refresh");
    var player = PlayerList.getPlayer(socket.id);
    if(player && player.evolutionQueue && player.evolutionQueue.length > 0 && player.evolutionQueue[0].includes(eclass.toLowerCase())) {
      eclass = eclass.toLowerCase();
      player.evolutionQueue.shift();
      var evo = evolutions[eclass];
      console.log(player.name + " evolved to " + eclass);

      if (player.evolution) {
        player.prevAbilityCooldown = evolutions[player.evolution].abilityCooldown;
      }

        player.evolutionData = {default: evo.default(), ability: evo.ability()};
      player.evolution =evo.name;
      player.ability = Date.now();
      player.checkSubEvolutions();
      player.updateValues();

      return;
    }
  });
  socket.on("ability", () => {
    if(!PlayerList.has(socket.id)) return socket.send("refresh");
    var player = PlayerList.getPlayer(socket.id);
    if(player.evolution != "") {
      // check if ability activated already
      if(player.ability <= Date.now()) {
        player.ability = evolutions[player.evolution].abilityCooldown + evolutions[player.evolution].abilityDuration + Date.now();
        console.log(player.name + " activated ability");
        socket.send("ability", [evolutions[player.evolution].abilityCooldown , evolutions[player.evolution].abilityDuration, Date.now()]);
      }
    }
  });

	socket.on("mousePos", (mousePos) => {
		if (PlayerList.has(socket.id)) {
			var thePlayer = PlayerList.getPlayer(socket.id);
			thePlayer.mousePos = mousePos;
			PlayerList.updatePlayer(thePlayer);

		}
		else socket.send("refresh");

		//console.log(mousePos.x +" , "+mousePos.y )
	});

  socket.on("throw", () => {
    if(PlayerList.has(socket.id)) {
      var player = PlayerList.getPlayer(socket.id);
      if(!player.swordInHand) return;
      if(Date.now() - player.lastSwordThrow < player.throwCooldown) return;
      player.swordInHand = false;
      flyingSwords.push({hit: [], scale: player.scale, x: player.pos.x, y: player.pos.y, time: Date.now(), angle: player.calcSwordAngle(), skin: player.skin, id: socket.id});
      io.sockets.send("newFlyingSword", flyingSwords[flyingSwords.length - 1]);
      player.lastSwordThrow = Date.now();
      PlayerList.updatePlayer(player);
    } else socket.send("refresh");
  });

	socket.on("mouseDown", (down) => {
		if (PlayerList.has(socket.id)) {
			var player = PlayerList.getPlayer(socket.id);
			if (player.mouseDown == down || !player.swordInHand) return;
			[coins,chests] = player.down(down, coins, io, chests);
			PlayerList.updatePlayer(player);
		} else socket.send("refresh");
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
	socket.on("chat", async (msg) => {
		msg = msg.trim().replace(/\\/g, "\\\\");
		if (msg.length > 0) {
			if (msg.length > 35) msg = msg.substring(0, 35);
			if (!PlayerList.has(socket.id) || Date.now() - PlayerList.getPlayer(socket.id).lastChat < 1000) return;
			var p = PlayerList.getPlayer(socket.id);
			p.lastChat = Date.now();
			PlayerList.setPlayer(socket.id, p);
      try {
			msg = await filtery.clean(msg);
				io.sockets.send("chat", {
					msg: filter.clean(msg),
					id: socket.id,
				});
			} catch(e) {
        io.sockets.send("chat", {
					msg: filter.clean(msg),
					id: socket.id,
				});
      }
    }
		});
	function clamp(num, min, max) {
		return num <= min ? min : num >= max ? max : num;
	}
	socket.on("disconnect", () => {
		if(serverState == "exiting") return;
		if (!PlayerList.has(socket.id)) return;
		var thePlayer = PlayerList.getPlayer(socket.id);
console.log(thePlayer.name + " - " + socket.id + " disconnected");
              //drop their coins
              var drop = [];
              var dropAmount = thePlayer.coins < 13 ? 10 : Math.round(thePlayer.coins < 25000 ? thePlayer.coins * 0.8 : Math.log10(thePlayer.coins) * 30000 - 111938.2002602);
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
                  },value, thePlayer.verified ? thePlayer.name : "")
                );
                dropped += value;
                drop.push(coins[coins.length - 1]);
              }

                io.sockets.send("coin", [drop, [thePlayer.pos.x, thePlayer.pos.y]]);


                if(useDb) {
                if(thePlayer.coins > 100000 || thePlayer.kills > 20 || thePlayer.time > 1800000) {
		sql`INSERT INTO games (name, coins, kills, time, verified) VALUES (${thePlayer.name}, ${thePlayer.coins}, ${thePlayer.kills}, ${Date.now() - thePlayer.joinTime}, ${thePlayer.verified})`;
                }
              }
                if(thePlayer.verified) {
                  /*
                  INSERT INTO public.stats (username, game_time, game_count, stabs, coins)
VALUES ('player1', 1000, 1, 5, 10)
ON CONFLICT (game_date, username)
DO UPDATE SET
  game_time = public.stats.game_time + EXCLUDED.game_time,
  game_count = public.stats.game_count + EXCLUDED.game_count,
  stabs = public.stats.stabs + EXCLUDED.stabs,
  coins = public.stats.coins + EXCLUDED.coins;
                  */
                  sql`INSERT INTO stats (username, game_time, game_count, stabs, coins) VALUES (${thePlayer.name}, ${Date.now() - thePlayer.joinTime}, 1, ${thePlayer.kills}, ${thePlayer.coins}) ON CONFLICT (username, game_date) DO UPDATE SET game_time = stats.game_time + EXCLUDED.game_time, game_count = stats.game_count + EXCLUDED.game_count, stabs = stats.stabs + EXCLUDED.stabs, coins = stats.coins + EXCLUDED.coins`;
                }


		PlayerList.deletePlayer(socket.id);
		socket.broadcast.send("playerLeave", socket.id);
	});
});

//tick
var secondStart = Date.now();
var lastChestSend = Date.now();
var lastCoinSend = Date.now();
var tps = 0;
var actps = 0;
app.get("/api/serverinfo", (req, res) => {
  var playerCount = Object.values(PlayerList.players).length;
  var lag = actps > 15 ? "No lag" : actps > 6 ? "Moderate lag" : "Extreme lag";
  res.send({
    playerCount,
    lag,
    maxPlayers,
    tps: actps,
    actualPlayercount: Object.values(PlayerList.players).filter((p) => !p.ai)
      .length,
  });
});

var lastSendAll = 0;
var allSendInt = 500;
var lastTick = Date.now();
setInterval(async () => {
  let delta = Date.now() - lastTick;
  lastTick = Date.now();
	//const used = process.memoryUsage().heapUsed / 1024 / 1024;
//console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
	PlayerList.clean();
	moderation.io = io;
	if (coins.length < maxCoins) {
		coins.push(new Coin());
		io.sockets.send("coin", [coins[coins.length - 1]]);
	}
	if(chests.filter(c=>c.rarity == "normal").length < maxChests) {
		chests.push(new Chest());
		io.sockets.send("chest", chests[chests.length - 1]);
	}
  if(chests.filter(c=>c.rarity == "uncommon").length < maxUncommonChests) {
		chests.push(new Chest(undefined, "uncommon"));
		io.sockets.send("chest", chests[chests.length - 1]);
	}
  if(chests.filter(c=>c.rarity == "rare").length < maxRareChests) {
		chests.push(new Chest(undefined, "rare"));
		io.sockets.send("chest", chests[chests.length - 1]);
	}
  if(chests.filter(c=>c.rarity == "epic").length < maxEpicChests) {
		chests.push(new Chest(undefined, "epic"));
		io.sockets.send("chest", chests[chests.length - 1]);
	}
  if(chests.filter(c=>c.rarity == "legendary").length < maxLegendaryChests && Math.random() < 0.1) {
		chests.push(new Chest(undefined, "legendary"));
		io.sockets.send("chest", chests[chests.length - 1]);
	}
  if(chests.filter(c=>c.rarity == "mythical").length < maxMythicalChests && Math.random() < 0.01) {
		chests.push(new Chest(undefined, "mythical"));
		io.sockets.send("chest", chests[chests.length - 1]);
	}
	var normalPlayers = Object.values(PlayerList.players).filter(p => p && !p.ai).length;
	var aiPlayers = Object.keys(PlayerList.players).length;
	// console.log(aiNeeded)
  function degrees_to_radians(degrees)
  {
    var pi = Math.PI;
    return degrees * (pi/180);
  }
 function movePointAtAngle(point, angle, distance) {
    return [
        point[0] + (Math.sin(angle) * distance),
        point[1] - (Math.cos(angle) * distance)
    ];
  }
  flyingSwords.forEach((sword, i) => {
    var a = degrees_to_radians(sword.angle-45);
    const wantspeed = 100;
    let speed  = delta/50 * wantspeed;
    sword.x += Math.cos(a) * speed;
    sword.y += Math.sin(a) * speed;

    //collision check
      //HARDCODED
    var tip = movePointAtAngle([sword.x, sword.y], a, (130*sword.scale));
    var base = movePointAtAngle([sword.x, sword.y], a, (130*sword.scale)*-1);
    Object.values(PlayerList.players).forEach((player, _) => {
      if(player.id == sword.id) return;
      if(Date.now() - player.joinTime < 5000) return;
      if(sword.hit.includes(player.id)) return;
      var swordOwner = PlayerList.getPlayer(sword.id);
      if(!swordOwner) return hit=true;


      // check line collision
      if(lineCircle(tip[0], tip[1], base[0], base[1], player.pos.x, player.pos.y, player.radius*player.scale)) {
        coins = swordOwner.dealHit(player, coins, io, sword.angle);
        hit = true;
        flyingSwords[i].hit.push(player.id);
      }

    });
    // chest collisions
    chests.forEach((chest, i) => {
      if(lineBox(tip[0], tip[1], base[0], base[1], chest.pos.x, chest.pos.y, chest.width, chest.height)) {
        chest.health -= 1;
        io.sockets.send("chestHealth", [chest.id, chest.health, sword.id]);
        if(chest.health <= 0) {
        chests.splice(chests.indexOf(chest), 1);
        io.sockets.send("collected", [chest.id, sword.id, false]);

        //drop coins at that spot
        var drop = chest.open();

        io.sockets.send("coin", [drop, [chest.pos.x+(chest.width/2), chest.pos.y+(chest.height/2)]]);
          coins.push(...drop);
        }
      }
    });
    if (Date.now() - sword.time > 1000) {
      flyingSwords.splice(i, 1);
      var player = PlayerList.getPlayer(sword.id);
      if(player) {
        player.swordInHand = true;
        PlayerList.updatePlayer(player);
      }
    }
  });
  // io.sockets.send("flyingSwords", flyingSwords);

	if (normalPlayers > 0 && aiPlayers < maxAiPlayers && getRandomInt(0,100) == 5) {
		var id = uuidv4();
		var theAi = new AiPlayer(id);
		PlayerList.setPlayer(id, theAi);
		io.sockets.send("new", theAi.getSendObj());
	}
	//send tps to clients
	if (Date.now() - secondStart >= 1000) {
		io.sockets.send("tps", tps);
		actps = tps;
		//console.log("Players: "+Object.keys(players).length+"\nTPS: "+tps+"\n")
		secondStart = Date.now();
		tps = 0;
	}
	if (Date.now() - lastChestSend >= 10000) {
		io.sockets.send("chests", chests);

		lastChestSend = Date.now();
	}

	//health regen
	var playersarray = Object.values(PlayerList.players);
	var sockets = await io.fetchSockets();

	sockets.forEach((b) => {
		if (!b.joined && Date.now() - b.joinTime > 60000) {
			b.send(
				"ban",
				"You have been kicked for not sending JOIN packet. <br>This is likely due to slow wifi.<br>If this keeps happening, try restarting your device."
			);
			b.disconnect();
		}

    if(!b.lastPinged) {
      b.lastPinged = 0;
      b.ping = 0;
      b.lastSuccessfullPing = 0;
      b.pong = true;
    }
    if((Date.now() - b.lastPinged > 2000) && b.pong) {
      b.pong = false;
      b.send("ping", b.ping);
      b.lastPinged = Date.now();
    } else if (Date.now() - b.lastPinged >30000) {
      b.send("ban", "You have been kicked for not responding to ping packets. <br>This is likely due to slow wifi.<br>If this keeps happening, try restarting your device.");
      // emit disconnect to players
      b.broadcast.send("playerDied", [b.id]);
      b.disconnect();


    }
	});

  const shouldSendAll = Date.now() - lastSendAll >= allSendInt;
  if(shouldSendAll) {
    var allArr = [];
  }
	playersarray.forEach((player) => {

		if(player) {
      player.updateValues();
      if(shouldSendAll) {
        allArr.push({
          id: player.id,
          name: player.name,
          pos: player.pos,
          scale: player.scale,
          coins: player.coins,
          ranking: player.ranking,
          verified: player.verified,
          zombie: player.zombie ?? undefined,
        });
      }
			//   player.moveWithMouse(players)
			if(player.ai) {
				[coins,chests] = player.tick(coins, io, levels, chests);
			}
			if (
				Date.now() - player.lastHit > player.healWait &&
      Date.now() - player.lastRegen > 75 &&
      player.health < player.maxHealth
			) {
				//if its been x seconds since player got hit, regen then every 100 ms
				player.lastRegen = Date.now();
				player.health += (player.health / 100)*player.healAmount;
			}
			PlayerList.updatePlayer(player);

			//send player data to all clients
			sockets.forEach((socket) => {
        var outOfRange = [];
				if(!player.getSendObj()) console.log("couldnt get send obj");
				if ((player.id != socket.id) && (PlayerList.getPlayer(socket.id) ? player.inRange(PlayerList.getPlayer(socket.id)) : true)) socket.send("player", player.getSendObj());
				else if(player.id == socket.id) {
					socket.send("me", player);
				if(Date.now() - lastCoinSend >= 1000) {
					socket.send("coins", coins.filter((coin) => coin.inRange(player)));
				}
				 	} else {
          outOfRange.push(player.id);
        }
        if(outOfRange.length > 0 && shouldSendAll) socket.send("outOfRange", outOfRange);
			});
		}
	});
	if(Date.now() - lastCoinSend >= 1000) {
		lastCoinSend = Date.now();
	}
  if(shouldSendAll) {
    io.sockets.send("all", allArr);
    lastSendAll = Date.now();
  }
	tps += 1;
}, 1000 / 20);

server.listen(process.env.PORT || 3000, () => {
  console.log("server started on port: ", process.env.PORT || 3000);
  setTimeout(async () => {
    if(!useDb) return;
    if(!xplb) {
      xplb = await sql`
      SELECT username, (SUM(coins) + SUM(stabs) * 300) AS xp
FROM public.stats
GROUP BY username
ORDER BY xp DESC;`;
    }
  }, 1000);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  cleanExit()
    .then(() => {
      console.log("exited cleanly");
      if(usewebhook) {
        Hook.custom(process.env.SERVER, "reason: SIGTERM\nexited cleanly").then(() => {
          process.exit(1);
        }).catch((e) => {
          console.log("Webhook failed", e);
          process.exit(1);
        });
      } else process.exit(1);
    })
    .catch((err) => {
      console.log("failed to exit cleanly");
      if(usewebhook) {
        Hook.custom(process.env.SERVER, `reason: SIGTERM\nFailed to exit cleanly\n\n\`\`\`${err.stack}\`\`\``).then(() => {
          process.exit(1);
        }).catch((e) => {
          console.log("Webhook failed", e);
          process.exit(1);
        });
      } else process.exit(1);

    });
});
process.on("SIGINT", () => {
  console.log("SIGINT received");
  cleanExit()
    .then(() => {
      console.log("exited cleanly");
      if(usewebhook) {
        Hook.custom(process.env.SERVER, "reason: SIGINT\nexited cleanly").then(() => {
          process.exit(1);
        }).catch((e) => {
          console.log("Webhook failed", e);
          process.exit(1);
        });
      } else process.exit(1);
    })
    .catch((err) => {
      console.log("failed to exit cleanly");
      if(usewebhook) {
        Hook.custom(process.env.SERVER, `reason: SIGINT\nFailed to exit cleanly\n\n\`\`\`${err.stack}\`\`\``).then(() => {
          process.exit(1);
        }).catch((e) => {
          console.log("Webhook failed", e);
          process.exit(1);
        });
      } else process.exit(1);
    });
});

//unhandledRejection
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  cleanExit()
    .then(() => {
      console.log("exited cleanly");
      if(usewebhook) {
      Hook.custom(process.env.SERVER, "reason: unhandledRejection\nexited cleanly\n\nError:```"+reason.stack+"```\n").then(() => {
        process.exit(1);
      }).catch((e) => {
        console.log("Webhook failed", e);
        process.exit(1);
      });
      } else process.exit(1);
    })
    .catch((e) => {
      console.log("failed to exit cleanly");
      if(usewebhook) {
        Hook.custom(process.env.SERVER, "reason: unhandledRejection\nfailed to exit cleanly\n\nError:```"+reason.stack+"```\n\nWhy cleanExit failed:```"+e.stack+"```").then(() => {
          process.exit(1);
        }).catch((e) => {
          console.log("Webhook failed", e);
          process.exit(1);
        });
        } else process.exit(1);
    });
});
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err.stack);
  cleanExit()
    .then(() => {
      console.log("exited cleanly");
      if(usewebhook) {
      Hook.custom(process.env.SERVER, "reason: uncaughtException\nexited cleanly\n\nError:```"+err.stack+"```").then(() => {
        process.exit(1);
      }).catch((e) => {
        console.log("Webhook failed", e);
        process.exit(1);
      });
      } else process.exit(1);
    })
    .catch((e) => {
      console.log("failed to exit cleanly");
      if(usewebhook) {
        Hook.custom(process.env.SERVER, "reason: unhandledRejection\nfailed to exit cleanly\n\nError:```"+err.stack+"```\nWhy cleanExit failed:```"+e.stack+"```").then(() => {
          process.exit(1);
        }).catch((e) => {
          console.log("Webhook failed", e);
          process.exit(1);
        });
        } else process.exit(1);
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
        socket.send(
          "ban",
          "<h1>Server is shutting down, we'll be right back!<br>Sorry for the inconvenience.<br><br>" +
            (player.verified
              ? " Your Progress has been saved in your account"
              : "") +
            "</h1><hr>"
        );
        socket.disconnect();
        if(useDb) {
        if(player.coins > 100000 || player.kills > 20 || player.time > 1800000) {
        await sql`INSERT INTO games (name, coins, kills, time, verified) VALUES (${
          player.name
        }, ${player.coins}, ${player.kills}, ${Date.now() - player.joinTime}, ${
          player.verified
        })`;
      }
    }
      if(player.verified) {
        /*
        INSERT INTO public.stats (username, game_time, game_count, stabs, coins)
VALUES ('player1', 1000, 1, 5, 10)
ON CONFLICT (game_date, username)
DO UPDATE SET
  game_time = public.stats.game_time + EXCLUDED.game_time,
  game_count = public.stats.game_count + EXCLUDED.game_count,
  stabs = public.stats.stabs + EXCLUDED.stabs,
  coins = public.stats.coins + EXCLUDED.coins;
        */
        await sql`INSERT INTO stats (username, game_time, game_count, stabs, coins) VALUES (${
          player.name
        }, ${Date.now() - player.joinTime}, 1, ${player.kills}, ${
          player.coins
        }) ON CONFLICT (username, game_date) DO UPDATE SET game_time = stats.game_time + EXCLUDED.game_time, game_count = stats.game_count + EXCLUDED.game_count, stabs = stats.stabs + EXCLUDED.stabs, coins = stats.coins + EXCLUDED.coins`;
      }
      }
    }
  }
}

setInterval(async () => {
  if(!useDb) return;
 xplb = await sql`SELECT username, (SUM(coins) + SUM(stabs) * 300) AS xp
 FROM public.stats
 GROUP BY username
 ORDER BY xp DESC;`;
 content = await sql`SELECT * FROM public.content`;
}, 120000);

/*
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers["host"] + req.url });
    res.end();
}).listen(80);
*/
