const Player = require("./Player")

class AiPlayer extends Player {
    constructor(id) {
        const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
        super(id, randomElement(["PlopyFun", "RoadCode", "32hropat", "Typer32", "McGod", "MitBlade", "Killer", "12345", "Hacker326", "sword", "swordgod", "sword.io", "player"]))
        this.ai = true;
    }
}

module.exports = AiPlayer