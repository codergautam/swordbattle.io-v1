

const Evolution = require("./Evolution");
class Juggernaut extends Evolution {
    constructor() {
        super();
        this.name = "juggernaut";
        this.abilityDuration = 8000;
        this.abilityCooldown = 50000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.5,
            health: 1.5,
            speed: 0.8,
            scale: 1.4,
            power: 1,
            resistance: 3.8,
            damage: 1.5,
            damageCooldown: 1.2,
            healAmount: 1.5,
            healWait: 2.5
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 2,
            scale: 2.1,
            power: 2.3,
            damageCooldown: 0.6,
            resistance: 1.3,
            speed: 1.9,
        };
    }
}
module.exports = Juggernaut;
