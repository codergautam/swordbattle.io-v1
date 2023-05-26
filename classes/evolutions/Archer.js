

const Evolution = require("./Evolution");
const Fisherman = require("./Fisherman");
const Archergod = require("./Archergod");
class Archer extends Evolution {
    constructor() {
        super();
        this.name = "archer";
        this.abilityDuration = 8000;
        this.abilityCooldown = 50000;
        this.subEvolutions = [4000, new Archergod(), new Fisherman()];
    }
    default() {
        return {
            maxHealth: 0.3,
            health: 0.3,
            speed: 1,
            scale: 1,
            power: 1.3,
            resistance: 0.5,
            damage: 0.05,
            damageCooldown: 1,
            healAmount: 1,
            healWait: 3,
            throwCooldown: 0.7,
            throwDamageMultiplier: 1.3,
        };
    }
    ability() {
        return {
            maxHealth: 0.5,
            health: 0.5,
            speed: 2,
            scale: 0.7,
            power: 1.5,
            resistance: 0.2,
            damage: 0.03,
            damageCooldown: 1,
            healAmount: 1.5,
            healWait: 1,
            throwCooldown: 0.4,
            throwDamageMultiplier: 1.6,
        };
    }
}
module.exports = Archer;
