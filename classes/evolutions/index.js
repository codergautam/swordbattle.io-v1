const fs = require("fs");
var evos = {};
fs.readdirSync("./classes/evolutions").forEach((file) => {
  if(file == "index.js" || file == "Evolution.js") return;
  var evo = require("./"+file);
  evo = new evo();
  evos[evo.name] = evo;
});
console.log("Loaded "+Object.keys(evos).length+" evolutions");
module.exports = evos;