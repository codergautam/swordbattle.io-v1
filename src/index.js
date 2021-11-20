import TitleScene from './TitleScene.js';
import GameScene from './GameScene.js';
import DeathScene from './DeathScene.js';
import WonScene from './WonScene.js';
import OpenScene from './OpenScene.js';

var config = {
    type: Phaser.CANVAS,
    width: window.visualViewport.width,
    height: window.visualViewport.height,
    parent: "game",
    dom: {
        createContainer: true
    },
    scale: {
        mode:Phaser.Scale.RESIZE,
    }
};

var game = new Phaser.Game(config);

var deathScene = new DeathScene()
var winScene = new WonScene()

var gameScene = new GameScene((data) => {
    if(data.win) {
        winScene.data = data.data
        gameScene.scene.start('win')
    } else {
    deathScene.data = data.data
    gameScene.scene.start('death')
    }
})

var titleScene = new TitleScene((name, music) => {
    gameScene.name = name
    gameScene.openingBgm = music
    titleScene.scene.start('game')
    titleScene.showPromo = false
})
titleScene.showPromo = true
var openScene = new OpenScene()
game.scene.add('title', titleScene)
game.scene.add('game', gameScene)
game.scene.add('death', deathScene)
game.scene.add('win', winScene)
game.scene.add('open', openScene)

game.scene.start('open')

//for debugging on the school chromebooks they fricking banned dev console
window.onerror = function(msg, url, line) {
    document.write("Error : " + msg + "<br><br>");
    document.write("Line number : " + line + "<br><br>");
    document.write("File : " + url);
}