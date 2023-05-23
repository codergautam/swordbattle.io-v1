

const Evolution = require("./Evolution");
class Fishergod extends Evolution {
    constructor() {
        super();
        this.name = "fishermgod";
        this.abilityDuration = 8000;
        this.abilityCooldown = 30000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.5,
            health: 1.5,
            speed: 1.5,
            scale: 1,
            power: 1.1,
            resistance: 1.1,
            damage: 1,
            damageCooldown: 1,
            healAmount: 1.7,
            healWait: 0.9
        };
    }
    ability() {
        return {
            healWait: 0.3,
            healAmount: 3,
            scale: 5,
            power: -5,
            damageCooldown: 0.3,
            resistance: 0.5,
            damage: 0.7,
            speed: 3,
        };
    }
}
module.exports = Fishergod;
