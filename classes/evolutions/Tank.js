const Evolution = require("./Evolution");
class Tank extends Evolution {
    constructor() {
        super();
        this.name = "tank";
        this.abilityDuration = 1000;
        this.abilityCooldown = 10000;
        this.subEvolutions = [];
    }
    default() {
        return {
            speed: 0.5,
            scale: 1.25,
            power: 2,
            resistance: 2,
            damage: 1.25,
            damageCooldown: 2,
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
