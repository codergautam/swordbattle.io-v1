const Evolution = require("./Evolution");
class Gladiator extends Evolution {
    constructor() {
        super();
        this.name = "gladiator";
        this.abilityDuration = 10000;
        this.abilityCooldown = 60000;
        this.subEvolutions = [knight];
    }
    default() {
        return {
            speed: 1.1,
            power: 5,
            resistance: 0.9,
            damage: 5,
            damageCooldown: 2.2,
        };
    }
    ability() {
        return {
            speed: 1,
            power: 1,
            resistance: 0.2,
            damage: 1,
            damageCooldown: 0.50,
        };
    }
}
module.exports = Gladiator;
