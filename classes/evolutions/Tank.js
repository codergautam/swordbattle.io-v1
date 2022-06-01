const Evolution = require("./Evolution");
class Tank extends Evolution {
    constructor() {
        super();
        this.name = "tank";
        this.abilityDuration = 5000;
        this.abilityCooldown = 60000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.5,
            health: 1.5,
            speed: 0.75,
            scale: 1.25,
            power: 2,
            resistance: 2,
            damage: 1.25,
            damageCooldown: 1.1,
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 5,
            scale: 2,
            damageCooldown: 0.5,
            damage: 2,
            resistance: 0
        };
    }
}
module.exports = Tank;
