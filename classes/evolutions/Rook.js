

const Evolution = require("./Evolution");
class Warrior extends Evolution {
    constructor() {
        super();
        this.name = "rook";
        this.abilityDuration = 8000;
        this.abilityCooldown = 50000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.7,
            health: 1.7,
            speed: 0.7,
            scale: 1.5,
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
            power: 2.5,
            damageCooldown: 0.7,
            resistance: 1,
            speed: 1.5,
        };
    }
}
module.exports = Warrior;