
const fs = require("fs");
const {execSync} = require("child_process"); 
require("dotenv").config();
var testenv =
`TOKEN=test
CAPTCHASECRET=6LeIewsgAAAAABWjEVCnFPR7POHFJbzZJM_OqKdQ
CAPTCHASITE=6LeIewsgAAAAAPp9VS21fBk7VWQX3wps40gWrUWH

USEFISHYSSL=false
DATABASE_URL=postgres://fishymine:P7oU3-qbHjgPTFnZRat7kw@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/bilked-blob-1224.defaultdb
PRODUCTION=false
SERVER=localhost
`
;

var defaultconfig = `{
  "CAPTCHASITE": "6LeIewsgAAAAAPp9VS21fBk7VWQX3wps40gWrUWH",
  "localServer": true,
  "recaptcha": false
}`;

//check if config.json exists
if (!fs.existsSync("./config.json")) {
	fs.writeFileSync("./config.json", "{}");
}
var theConfig = require("./config.json");


if(!theConfig.hasOwnProperty("localServer")) {
	console.log("Generating config.json");
	fs.writeFileSync("./config.json", defaultconfig);
	theConfig = require("./config.json");
    console.log("⚡ Hold on...");
  execSync("npm i --dev");
	execSync("npm run build");
	console.log("⚡ Done!");
}
if(!process.env.hasOwnProperty("TOKEN")) {
	console.log("👀 We're getting you set up.\n");
	fs.writeFileSync(".env", testenv);
	fs.writeFileSync("config.json", defaultconfig);
	console.log("⚒️ Installing dependencies... \n");
	theConfig = require("./config.json");
	//run npm run build

  execSync("npm i --dev");
        console.log("\n ⚒️ Building code..\n");
	execSync("npm run build");
	console.log("✅ Done!");

//	process.exit(1);
}

if(process.env.PRODUCTION == "true") {
	console.log("🚀 Using production setup...\n");
	if(process.env.CAPTCHASITE) {
		theConfig.CAPTCHASITE = process.env.CAPTCHASITE;
	}
	theConfig.localServer = false;
  theConfig.recaptcha = true;
	fs.writeFileSync("config.json", JSON.stringify(theConfig));
	console.log("Note: We've updated the config.json file to reflect this.\n");
	console.log("If you're running this during development, the game won't work\n");
	console.log("🔥 Creating a production build...");
  execSync("npm i --dev");
	execSync("npm run prod");
	console.log("✅ Done!\n");

}