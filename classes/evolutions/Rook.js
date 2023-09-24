

const Evolution = require("./Evolution");
const Samurai = require("./Samurai");
const Lumberjack = require("./Lumberjack");
class Rook extends Evolution {
    constructor() {
        super();
        this.name = "rook";
        this.abilityDuration = 8000;
        this.abilityCooldown = 50000;
        this.subEvolutions = [30000, new Samurai(), new Lumberjack()];
    }
    default() {
        return {
            maxHealth: 1.4,
            health: 1.4,
            speed: 0.8,
            scale: 1.3,
            power: 1,
            resistance: 5.5,
            damage: 1.6,
            damageCooldown: 1.3,
            healAmount: 1.5,
            healWait: 2
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 1.5,
            scale: 1.6,
            power: 1.75,
            damageCooldown: 0.7,
            resistance: 1,
            speed: 1.6,
        };
    }
}
module.exports = Rook;
