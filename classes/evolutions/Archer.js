

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
            maxHealth: 1.4,
            health: 1.4,
            speed: 1.4,
            scale: 0.6,
            power: 3,
            resistance: 0.5,
            damage: 0.1,
            damageCooldown: 1,
            healAmount: 1.5,
            healWait: 1,
            throwCooldown: 0.3,
            throwDamageMultiplier: 40,
        };
    }
    ability() {
        return {
            maxHealth: 1.4,
            health: 1.4,
            speed: 2,
            scale: 0.4,
            power: 3,
            resistance: 0.5,
            damage: 0.1,
            damageCooldown: 1,
            healAmount: 1.5,
            healWait: 1,
            throwCooldown: 0.1,
            throwDamageMultiplier: 30,
        };
    }
}
module.exports = Archer;
