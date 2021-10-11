import kaboom from "https://unpkg.com/kaboom@next/dist/kaboom.mjs";
import { viewport } from "/js/functions.js"

var socket = io()


kaboom({
background: [255,255,255],
width: viewport().width - 10,
height: viewport().height - 10
});

loadSprite("player", "/assets/images/player.png")
loadSprite("sword", "/assets/images/sword.png")


var mouseDown =false
var mousePos = vec2(0,0)
// add a piece of text at position (120, 80)
const player = add([
sprite("player"),
pos(0,0),
scale(0.25,0.25),
area({ width: 12, height: 12, offset: vec2(0, 6) }),
solid(),
origin("center"),
]);

const sword = add([
    sprite("sword"),
    pos(0,0),
    scale(0.25,0.25),
    area(),
    solid(),
    origin("center"),
    rotate(0)
    ]);
mouseClick(() => {
    if(!mouseDown) {
        mouseDown=true
        socket.emit("mouseDown", true)
    }
})
mouseRelease(() => {
    if(mouseDown) {
        mouseDown = false
        socket.emit("mouseDown", false)
    }
})
mouseMove((m) => {
    mousePos = m
});
//control
var controller = {left: false, up: false, right: false, down: false}
keyPress("left", () => {controller.left = true});
keyPress("a", () => {controller.left = true});
keyPress("w", () => {controller.up = true});
keyPress("up", () => {controller.up = true});
keyPress("right", () => {controller.right = true});
keyPress("d", () => {controller.right = true});
keyPress("s", () => {controller.down = true});
keyPress("down", () => {controller.down = true});
keyRelease("left", () => {controller.left = false});
keyRelease("a", () => {controller.left = false});
keyRelease("w", () => {controller.up = false});
keyRelease("up", () => {controller.up = false});
keyRelease("right", () => {controller.right = false});
keyRelease("d", () => {controller.right = false});
keyRelease("s", () => {controller.down = false});
keyRelease("down", () => {controller.down = false});
action(() => {
    var old = sword.angle
    sword.angle = Math.atan2(mousePos.y - ((viewport().height - 10) / 2), mousePos.x - ((viewport().width - 10)/2))* 180 / Math.PI + 45;
    if(old != sword.angle) socket.emit("angle", sword.angle)
    
    sword.pos = vec2(player.pos.x+player.width/6*Math.cos(sword.angle*Math.PI/180), player.pos.y+player.width/6*Math.sin(sword.angle*Math.PI/180))
    if(mouseDown) sword.angle -= 30
   // sword.pos.x -= 15

   

 

   socket.emit("move", controller);
    
})




camPos(player.pos)
socket.emit("go")
