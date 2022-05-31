const Evolution = require("./Evolution");
class Berserker extends Evolution {
    constructor() {
        super();
        this.name = "berserker";
        this.abilityDuration = 10000;
        this.abilityCooldown = 60000;
        this.subEvolutions = [];
    }
    default() {
        return {
            speed: 1,
            power: 1,
            resistance: 1.1,
            damage: 1.25,
            damageCooldown: 1,
        };
    }
    ability() {
        return {
            speed: 1.8,
            power: 2,
            resistance: 1.2,
            damage: 2,
            damageCooldown: 0.5,
        };
    }
}
module.exports = Berserker;
