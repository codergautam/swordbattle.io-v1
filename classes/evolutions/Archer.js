

const Evolution = require("./Evolution");
const Fisherman = require("./Fisherman");
const Archergod = require("./Archergod");
class Archer extends Evolution {
    constructor() {
        super();
        this.name = "archer";
        this.abilityDuration = 5000;
        this.abilityCooldown = 20000;
        this.subEvolutions = [400, new Archergod(), new Fisherman()];
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
            healAmount: 1.5,
            healWait: 0.5,
            throwCooldown: 0.7,
            throwDamageMultiplier: 140,
        };
    }
    ability() {
        return {
            maxHealth: 1.5,
            health: 1.5,
            speed: 2,
            scale: 0.7,
            power: 1.5,
            resistance: 0.2,
            damage: 0.03,
            damageCooldown: 1,
            healAmount: 1.8,
            healWait: 0,
            throwCooldown: 0.4,
            throwDamageMultiplier: 200,
        };
    }
}
module.exports = Archer;
