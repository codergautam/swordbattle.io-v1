

const Evolution = require("./Evolution");
class Fisherman extends Evolution {
    constructor() {
        super();
        this.name = "fisherman";
        this.abilityDuration = 7000;
        this.abilityCooldown = 45000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1,
            health: 1,
            speed: 1.1,
            scale: 1,
            power: 1,
            resistance: 1,
            damage: 1.8,
            damageCooldown: 1.3,
            healAmount: 1.5,
            healWait: 1
        };
    }
    ability() {
        return {
            healWait: 0.5,
            healAmount: 3,
            scale: 1.2,
            power: 1,
            damageCooldown: 0.3,
            resistance: 1,
            damage: 1.4,
            speed: 2,
            throwCooldown: 0,
        };
    }
}
module.exports = Fisherman;
