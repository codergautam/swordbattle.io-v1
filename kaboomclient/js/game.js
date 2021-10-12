import kaboom from "https://unpkg.com/kaboom@next/dist/kaboom.mjs";
import { viewport } from "/kaboomclient/js/resources.js"

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

var players = []
var swords = []

var ready = false;
// add a piece of text at position (120, 80)
var player = add([
sprite("player"),
pos(0,0),
scale(0.25,0.25),
area({ width: 12, height: 12, offset: vec2(0, 6) }),
solid(),
origin("center"),
]);

var sword = add([
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
   camPos(player.pos)
    
})

function addPlayer(player) {
  players[players.length] = add([
sprite("player"),
pos(player.pos.x,player.pos.y),
scale(0.25,0.25),
area({ width: 12, height: 12, offset: vec2(0, 6) }),
solid(),
origin("center"),
player.id
]);

swords[swords.length] = add([
  sprite("sword"),
  pos(player.pos.x,player.pos.y),
  scale(0.25,0.25),
  area({ width: 12, height: 12, offset: vec2(0, 6) }),
  solid(),
  origin("center"),
  player.id
  ]);
  
}


function removePlayer(playerId) {
  try {
  players.splice(players.findIndex(player => player.is(playerId)), 1);
  swords.splice(swords.findIndex(sword => sword.is(playerId)), 1);
  destroy(get(playerId)[0])
  destroy(get(playerId)[1])
  } catch(e) {
    console.log(e)
  }

}

socket.on("players", (players) => {
 players.forEach(player => addPlayer(player))
  ready = true
})

socket.on("new", (player) => {
  addPlayer(player)
  ready = true
})

socket.on("playerLeave", (id) => {
  if(ready) removePlayer(id)
})

socket.on("move", (id, pos) => {
  if(ready) {
    //alert(pos.x)
 get(id)[0].pos = vec2(pos.x, pos.y)
  get(id)[1].pos = vec2(pos.x+ get(id)[0].width/6*Math.cos(get(id)[1].angle*Math.PI/180), pos.y+ get(id)[0].width/6*Math.sin(get(id)[1].angle*Math.PI/180))
  }
  
})

socket.on("angle", (id, angle) => {
  if(ready) {
    //alert(angle)
  get(id)[1].angle = angle
    get(id)[1].pos = vec2(get(id)[0].pos.x+ get(id)[0].width/6*Math.cos(angle*Math.PI/180), get(id)[0].pos.y+ get(id)[0].width/6*Math.sin(angle*Math.PI/180))
  }
})


socket.on("myPos", (pos) => {
  player.pos = vec2(pos.x, pos.y)
})

socket.on("refresh", ()=> {
  location.reload()
})

socket.emit("go")
