

const Evolution = require("./Evolution");
const Fisherman = require("./Fisherman");
const Archergod = require("./Archergod");
class Archer extends Evolution {
    constructor() {
        super();
        this.name = "archer";
        this.abilityDuration = 5000;
        this.abilityCooldown = 80000;
        this.subEvolutions = [50000, new Archergod(), new Fisherman()];
    }
    default() {
        return {
            maxHealth: 0.4,
            health: 0.4,
            speed: 1,
            scale: 1,
            power: 1.3,
            resistance: 0.5,
            damage: 0.05,
            damageCooldown: 1,
            healAmount: 2,
            healWait: 1,
            throwCooldown: 0.7,
            throwDamageMultiplier: 90,
        };
    }
    ability() {
        return {
            maxHealth: 0.7,
            health: 0.7,
            speed: 1.3,
            scale: 0.7,
            power: 3,
            resistance: 0.2,
            damage: 0.05,
            damageCooldown: 1,
            healAmount: 1,
            healWait: 0,
            throwCooldown: 0.15,
            throwDamageMultiplier: 9,
        };
    }
}
module.exports = Archer;
