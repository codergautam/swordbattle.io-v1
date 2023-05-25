

const Evolution = require("./Evolution");
class Fishergod extends Evolution {
    constructor() {
        super();
        this.name = "fishergod";
        this.abilityDuration = 8000;
        this.abilityCooldown = 30000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.4,
            health: 1.4,
            speed: 1.2,
            scale: 0.9,
            power: 1,
            resistance: 1,
            damage: 0.9,
            damageCooldown: 1.3,
            healAmount: 1.5,
            healWait: 1
        };
    }
    ability() {
        return {
            healWait: 0.5,
            healAmount: 3,
            scale: 3,
            power: -2.5,
            damageCooldown: 0.3,
            resistance: 1,
            damage: 0.5,
            speed: 2.5,
        };
    }
}
module.exports = Fishergod;
