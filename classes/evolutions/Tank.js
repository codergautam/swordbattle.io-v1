const Evolution = require("./Evolution");
class Tank extends Evolution {
    constructor() {
        super();
        this.name = "tank";
        this.abilityDuration = 3000;
        this.abilityCooldown = 120000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.25,
            health: 1.25,
            speed: 0.75,
            scale: 1.25,
            power: 2,
            resistance: 2,
            damage: 1,
            damageCooldown: 1.2,
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 5,
            scale: 2,
        };
    }
}
module.exports = Tank;
