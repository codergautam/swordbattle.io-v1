import TitleScene from "./TitleScene.js";
import GameScene from "./GameScene.js";
import OpenScene from "./OpenScene.js";
import Phaser from "phaser";

if ("serviceWorker" in navigator) {
    // register service worker
    navigator.serviceWorker.register("sw.js");
  }


 window.addEventListener("online", handleConnection);
window.addEventListener("offline", handleConnection);

function handleConnection() {

  if (!navigator.onLine) {

    		document.write("<h1>You got disconnected</h1><br><button onclick=\"location.reload()\"><h1>Refresh</h1></button>");
  } else {
    		document.write("<h1>You're back online! Refresh to play!</h1>");
  }
  try {
    screen.orientation.lock("landscape");

  } catch (err) {
      console.log("failed to lock orientation", err);
  }
}


function canvas() {
    let downGrade = 1; // Do not change this, it breaks the game
    return {
        width: document.documentElement.clientWidth/downGrade,
        height: document.documentElement.clientHeight/downGrade,
        downGrade
    };
}

window.addEventListener("load", () => {
    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = "__storage_test__";
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    }

    var sva = storageAvailable("localStorage");
    let options;
    if(!sva) options = {};
    else {
    try {
        options = JSON.parse(window.localStorage.getItem("options"));
    } catch (e) {
        options = {};
    }
}
    console.warn(options, "options");
if(!navigator.onLine) handleConnection();
var config = {
    type: Phaser.CANVAS,
    width: canvas().width,
    height: canvas().height,
    parent: "game",
    dom: {
        createContainer: true,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scale: {
        mode:Phaser.Scale.NONE,
    },
    pixelArt: (options?.antiAliasing == "false") ? true : false,
    resolution: 0.5
};
var mobile = window.matchMedia("(pointer: coarse)").matches;
var game = new Phaser.Game(config);

var openScene = new OpenScene();


//var sva=false
var firstPlay = window.localStorage.getItem("lastAd") === null ? true : false;
if(sva && firstPlay) {
window.localStorage.setItem("lastAd", 0);
var lastAd = 0;
} else if(!sva) {
  var lastAd = 0;
} else {
  var lastAd = Number(window.localStorage.getItem("lastAd"));
}
//alert(lastAd)
var scale = "scale(1)";
document.body.style.webkitTransform =       // Chrome, Opera, Safari
 document.body.style.msTransform =          // IE 9
 document.body.style.transform = scale;     // General

var adDelay = 70000;
var gameScene = new GameScene((instantStart=false) => {
    titleScene.playPreroll = Date.now() - lastAd > adDelay;
    console.log(instantStart, "instantStart");
    titleScene.instantStart = instantStart;
    firstPlay = false;
});
console.log(Date.now()-lastAd, "lastAd")
var titleScene = new TitleScene(((Date.now() - lastAd > adDelay) && !firstPlay), (name, music, secret, adFailed = false) => {
    gameScene.name = name;
    gameScene.options = titleScene.options;
    if(gameScene.options.server == "auto") gameScene.options.server = titleScene.optimalServer;
    gameScene.openingBgm = music;
    gameScene.secret = secret;

    titleScene.scene.start("game");
    titleScene.showPromo = false;
    if(!adFailed) {
    console.log(Date.now()-lastAd, "lastAd")

    if(( Date.now() - lastAd > adDelay)) {
        if(sva){
      window.localStorage.setItem("lastAd", Date.now());
       lastAd = Date.now();
    } else {
      lastAd = Date.now();
    }
}
}else {
    console.log("ad failed")
}
});

titleScene.mobile = mobile;
gameScene.mobile = mobile;
openScene.mobile = mobile;
titleScene.instantStart = false;

if(!mobile) titleScene.showPromo = true;
//titleScene.showPromo = false;



Object.defineProperty(titleScene, "canvas", {
    get: canvas
});
Object.defineProperty(gameScene, "canvas", {
    get: canvas
});
Object.defineProperty(openScene, "canvas", {
    get: canvas
});



game.scene.add("title", titleScene);
game.scene.add("game", gameScene);
game.scene.add("open", openScene);

game.scene.start("open");

document.addEventListener("contextmenu",function(e) {
    e.preventDefault();
});


//for debugging on the school chromebooks they fricking banned dev console
/*window.onerror = function(msg, url, line) {
    document.write("Error : " + msg + "<br><br>");
    document.write("Line number : " + line + "<br><br>");
    document.write("File : " + url);
};*/
});
