import TitleScene from "./TitleScene.js";
import GameScene from "./GameScene.js";
import DeathScene from "./DeathScene.js";
import WonScene from "./WonScene.js";
import OpenScene from "./OpenScene.js";

window.addEventListener("load", () => {

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

//lol codergautamyt skin
window.setSecret = () => {
    window.localStorage.setItem("skinSecret", prompt("Enter your secret skin code"));
};

var playPreroll = true;
var lastAd = 0;
var adDelay = 1200000;
var gameScene = new GameScene((data) => {
    titleScene.playPreroll = (playPreroll && Date.now() - lastAd > adDelay);
    if(data.win) {
        winScene.data = data.data;
        gameScene.scene.start("win");
    } else {
    deathScene.data = data.data;
    gameScene.scene.start("death");
    }
});

var titleScene = new TitleScene((playPreroll && Date.now() - lastAd > adDelay), (name, music) => {
    gameScene.name = name;
    gameScene.openingBgm = music;
    titleScene.scene.start("game");
    titleScene.showPromo = false;
    if((playPreroll && Date.now() - lastAd > adDelay)) lastAd = Date.now();
});

titleScene.mobile = mobile;
gameScene.mobile = mobile;

if(!mobile) titleScene.showPromo = true;

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