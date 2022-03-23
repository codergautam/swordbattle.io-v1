import TitleScene from "./TitleScene.js";
import GameScene from "./GameScene.js";
import DeathScene from "./DeathScene.js";
import WonScene from "./WonScene.js";
import OpenScene from "./OpenScene.js";

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
  
}


window.addEventListener("load", () => {
if(!navigator.onLine) handleConnection();
var config = {
    type: Phaser.CANVAS,
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    parent: "game",
    dom: {
        createContainer: true,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scale: {
        mode:Phaser.Scale.RESIZE,
    }
    
};
var mobile = window.matchMedia("(pointer: coarse)").matches;
var game = new Phaser.Game(config);

var deathScene = new DeathScene();
var winScene = new WonScene();
var openScene = new OpenScene();

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
//var sva=false
var playPreroll = true;
if(sva && window.localStorage.getItem("lastAd") === null) {
window.localStorage.setItem("lastAd", 0);
var lastAd = 0;
} else if(!sva) {
  var lastAd =0;
} else {
  var lastAd = Number(window.localStorage.getItem("lastAd"));
}
//alert(lastAd)

var adDelay = 300000;
var gameScene = new GameScene((data) => {
    titleScene.playPreroll = (playPreroll && Date.now() - lastAd > adDelay);
});

var titleScene = new TitleScene((playPreroll && Date.now() - lastAd > adDelay), (name, music, secret) => {
    gameScene.name = name;
    gameScene.options = titleScene.options;
    gameScene.openingBgm = music;
    gameScene.secret = secret;

    titleScene.scene.start("game");
    titleScene.showPromo = false;
    if((playPreroll && Date.now() - lastAd > adDelay)) if(sva){
      window.localStorage.setItem("lastAd", Date.now());
       lastAd = Date.now();
    } else {
      lastAd = Date.now();
    }
});

titleScene.mobile = mobile;
gameScene.mobile = mobile;

if(!mobile) titleScene.showPromo = true;
//titleScene.showPromo = false;

function canvas() {
    return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    };
}

Object.defineProperty(titleScene, "canvas", {
    get: canvas
});
Object.defineProperty(deathScene, "canvas", {
    get: canvas
});
Object.defineProperty(winScene, "canvas", {
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
game.scene.add("death", deathScene);
game.scene.add("win", winScene);
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
