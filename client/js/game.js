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



// add a piece of text at position (120, 80)
const player = add([
sprite("player"),
pos(100,100),
scale(0.25,0.25),
area({ width: 12, height: 12, offset: vec2(0, 6) }),
solid(),
origin("center"),
]);

const sword = add([
    sprite("sword"),
    pos(0,0),
    scale(0.25,0.25),
    area({ width: 12, height: 12, offset: vec2(0, 6) }),
    solid(),
    origin("center"),
    rotate(0)
    ]);

mouseMove((mousePos) => {
    var offset = 45
    sword.angle = Math.atan2(mousePos.y - ((viewport().height - 10) / 2), mousePos.x - ((viewport().width - 10)/2))* 180 / Math.PI +45;
    sword.pos = player.pos
    console.log(sword.pos)
})

camPos(player.pos)
socket.emit("go")