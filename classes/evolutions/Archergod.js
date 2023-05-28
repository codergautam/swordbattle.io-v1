

const Evolution = require("./Evolution");
class Archergod extends Evolution {
    constructor() {
        super();
        this.name = "archergod";
        this.abilityDuration = 8000;
        this.abilityCooldown = 70000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 0.5,
            health: 0.5,
            speed: 1.1,
            scale: 1,
            power: 1.5,
            resistance: 0.8,
            damage: 0.06,
            damageCooldown: 0.9,
            healAmount: 1.8,
            healWait: 2,
            throwCooldown: 0.7,
            throwDamageMultiplier: 70,
        };
    }
    ability() {
        return {
            maxHealth: 0.8,
            health: 0.8,
            speed: 1.6 ,
            scale: 0.5,
            power: 1.5,
            resistance: 0.2,
            damage: 0.03,
            damageCooldown: 1,
            healAmount: 0.9,
            healWait: 0,
            throwCooldown: 0.3,
            throwDamageMultiplier: 150
        };
    }
}
module.exports = Archergod;
