const Evolution = require("./Evolution");
class Samurai extends Evolution {
    constructor() {
        super();
        this.name = "samurai";
        this.abilityDuration = 3000;
        this.abilityCooldown = 80000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.3,
            health: 1.3,
            speed: 0.75,
            scale: 1.5,
            power: 1.25,
            resistance: 0.9,
            damage: 1.25,
            damageCooldown: 1,
            healAmount: 1.5,
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 5,
            scale: 2.5,
            power: 3,
            damageCooldown: 0.5,
            damage: 2,
            resistance: 0.5,
            speed: 4,
        };
    }
}
module.exports = Samurai;
