var fs = require("fs");
var map = 15000;
var bushCount = 300;
var locations = [];

function getRandom(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function getRandomBush() {
    var x = Math.floor(getRandom((-1*map)/2, map/2));
    var y = Math.floor(getRandom((-1*map)/2, map/2));
    var scale = getRandom(0.5, 5);
    return { x: x, y: y, scale };
}

for(var i = 0; i < bushCount; i++) {
    locations.push(getRandomBush());
}

var json = {locations};
json = JSON.stringify(json);

fs.writeFileSync("src/bushes.json", json);