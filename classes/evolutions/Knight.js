const Evolution = require("./Evolution");
class Knight extends Evolution {
    constructor() {
        super();
        this.name = "knight";
        this.abilityDuration = 10000;
        this.abilityCooldown = 60000;
        this.subEvolutions = [];
    }
    default() {
        return {
            speed: 1.1,
            power: 1.1,
            resistance: 0.9,
            damage: 1,
            damageCooldown: 1,
        };
    }
    ability() {
        return {
            speed: 2,
            power: 0.7,
            resistance: 0.2,
            damage: 1.5,
            damageCooldown: 0.3,
        };
    }
}
module.exports = Knight;