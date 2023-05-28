const Archer = require("./Archer");
const Evolution = require("./Evolution");
const Fisherman = require("./Fisherman");
const Samurai = require("./Samurai");
class Knight extends Evolution {
    constructor() {
        super();
        this.name = "knight";
        this.abilityDuration = 10000;
        this.abilityCooldown = 50000;
        this.subEvolutions = [30000, new Archer(), new Samurai()];
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
            damageCooldown: 0.4,
        };
    }
}
module.exports = Knight;