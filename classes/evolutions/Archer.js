

const Evolution = require("./Evolution");
class Archer extends Evolution {
    constructor() {
        super();
        this.name = "archer";
        this.abilityDuration = 8000;
        this.abilityCooldown = 50000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 0.4,
            health: 0.4,
            speed: 1.2,
            scale: 1,
            power: 1.3,
            resistance: 0.5,
            damage: 0.05,
            damageCooldown: 1,
            healAmount: 1,
            healWait: 3,
            throwCooldown: 0.5,
            throwDamageMultiplier: 2,
        };
    }
    ability() {
        return {
            maxHealth: 0.5,
            health: 0.5,
            speed: 2,
            scale: 0.4,
            power: 1.5,
            resistance: 0.2,
            damage: 0.05,
            damageCooldown: 1,
            healAmount: 1.5,
            healWait: 1,
            throwCooldown: 0.4,
            throwDamageMultiplier: 5,
        };
    }
}
module.exports = Archer;
