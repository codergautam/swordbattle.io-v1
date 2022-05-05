const Evolution = require("./Evolution");
class Tank extends Evolution {
    constructor() {
        super();
        this.name = "tank";
        this.abilityDuration = 10000;
        this.abilityCooldown = 30000;
        this.subEvolutions = [];
    }
    default() {
        return {
            speed: 0.5,
            scale: 1.25,
            power: 2,
            resistance: 2,
            damage: 1.25,
            hitCooldown: 2,
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 5,
        };
    }
}
module.exports = Tank;
