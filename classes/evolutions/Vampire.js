
const Evolution = require("./Evolution");
class Warrior extends Evolution {
    constructor() {
        super();
        this.name = "vampire";
        this.abilityDuration = 7000;
        this.abilityCooldown = 40000;
        this.subEvolutions = [];
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
            leech: 1.1,
        };
    }
    ability() {
        return {
            leech: 1.2,
            speed: 1.7,
            resistance: 1,
        };
    }
}
module.exports = Warrior;