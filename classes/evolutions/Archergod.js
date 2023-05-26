

const Evolution = require("./Evolution");
class Archergod extends Evolution {
    constructor() {
        super();
        this.name = "archergod";
        this.abilityDuration = 8000;
        this.abilityCooldown = 30000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 0.4,
            health: 0.4,
            speed: 1.3,
            scale: 1,
            power: 1.5,
            resistance: 0.8,
            damage: 0.06,
            damageCooldown: 0.9,
            healAmount: 1.2,
            healWait: 3,
            throwCooldown: 0.5,
            throwDamageMultiplier: 1.5,
        };
    }
    ability() {
        return {
            maxHealth: 0.4,
            health: 0.4,
            speed: 2.5,
            scale: 0.5,
            power: 1.5,
            resistance: 0.2,
            damage: 0.03,
            damageCooldown: 1,
            healAmount: 1.5,
            healWait: 1,
            throwCooldown: 0.3,
            throwDamageMultiplier: 2,
        };
    }
}
module.exports = Archergod;
