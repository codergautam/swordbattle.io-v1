
const Archer = require("./Archer");
const Evolution = require("./Evolution");
const Fisherman = require("./Fisherman");
const Lumberjack = require("./Lumberjack");

class Warrior extends Evolution {
    constructor() {
        super();
        this.name = "vampire";
        this.abilityDuration = 7000;
        this.abilityCooldown = 35000;
        this.subEvolutions = [30000, new Archer(), new Lumberjack()];
    }
    default() {
        return {
            maxHealth: 0.85,
            health: 0.85,
            speed: 1.2,
            scale: 1.15,
            power: 0.9,
            resistance: 0.7,
            damage: 1.1,
            damageCooldown: 0.85,
            healAmount: 0.8,
            leech: 1.3,
        };
    }
    ability() {
        return {
            leech: 2,
            speed: 1.8,
            resistance: 1.5,
        };
    }
}
module.exports = Warrior;