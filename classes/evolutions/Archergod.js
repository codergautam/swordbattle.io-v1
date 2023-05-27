

const Evolution = require("./Evolution");
class Archergod extends Evolution {
    constructor() {
        super();
        this.name = "archergod";
        this.abilityDuration = 8000;
        this.abilityCooldown = 40000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 0.5,
            health: 0.5,
            speed: 1.3,
            scale: 1,
            power: 1.5,
            resistance: 0.8,
            damage: 0.06,
            damageCooldown: 0.9,
            healAmount: 1.8,
            healWait: 0.4,
            throwCooldown: 0.5,
            throwDamageMultiplier: 120,
        };
    }
    ability() {
        return {
            maxHealth: 1.3,
            health: 1.3,
            speed: 2.5,
            scale: 0.5,
            power: 1.5,
            resistance: 0.2,
            damage: 0.03,
            damageCooldown: 1,
            healAmount: 2,
            healWait: 0,
            throwCooldown: 0.3,
            throwDamageMultiplier: 200,
        };
    }
}
module.exports = Archergod;
