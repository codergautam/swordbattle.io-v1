

const Evolution = require("./Evolution");

const Warrior = require("./Warrior");
const Rook = require("./Rook");

class Tank extends Evolution {
    constructor() {
        super();
        this.name = "tank";
        this.abilityDuration = 5000;
        this.abilityCooldown = 60000;
        this.subEvolutions = [20000, new Warrior(), new Rook()];
    }
    default() {
        return {
            maxHealth: 1.6,
            health: 1.6,
            speed: 0.75,
            scale: 1.25,
            power: 1.25,
            resistance: 2,
            damage: 1.25,
            damageCooldown: 1.1,
            healAmount: 1.25,
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 5,
            scale: 1.75,
            power: 1.75,
            damageCooldown: 0.5,
            damage: 2,
            resistance: 2,
        };
    }
}
module.exports = Tank;