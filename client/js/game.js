// import kaboom lib
import kaboom from "https://unpkg.com/kaboom@next/dist/kaboom.mjs";

var socket = io()

// initialize kaboom context
kaboom({
background: [255,255,255]
});

loadSprite("player", "/assets/images/player.png")

// add a piece of text at position (120, 80)
var playerObj = new Player()
const player = add([
sprite("player"),
pos(0,0),
scale(0.25,0.25),
area({ width: 12, height: 12, offset: vec2(0, 6) }),
solid(),
origin("center"),
]);
camPos(player.pos)
socket.emit("go")