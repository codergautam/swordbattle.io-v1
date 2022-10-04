

const Evolution = require("./Evolution");

const Knight = require("./Knight");
const Vampire = require("./Vampire");

class Berserker extends Evolution {
    constructor() {
        super();
        this.name = "berserker";
        this.abilityDuration = 10000;
        this.abilityCooldown = 60000;
        this.subEvolutions = [20000, new Knight(), new Vampire()];
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
            speed: 1.5,
            power: 2,
            resistance: 1.2,
            damage: 1.5,
            damageCooldown: 0.5,
        };
    }
}
module.exports = Berserker;