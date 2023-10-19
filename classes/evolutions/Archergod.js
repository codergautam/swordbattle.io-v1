

const Evolution = require("./Evolution");
class Archergod extends Evolution {
    constructor() {
        super();
        this.name = "archergod";
        this.abilityDuration = 6000;
        this.abilityCooldown = 60000;
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
            damage: 1,
            damageCooldown: 0.9,
            healAmount: 1.8,
            healWait: 2,
            throwCooldown: 0.5,
            throwDamageMultiplier: 10,
        };
    }
    ability() {
        return {
            maxHealth: 1,
            health: 1,
            speed: 1.8 ,
            scale: 0.5,
            power: 3,
            resistance: 0.2,
            damage: 0.03,
            damageCooldown: 1,
            healAmount: 0.9,
            healWait: 0,
            throwCooldown: 0,
            throwDamageMultiplier: 12
        };
    }
}
module.exports = Archergod;
