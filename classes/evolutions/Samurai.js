const Evolution = require("./Evolution");
class Samurai extends Evolution {
    constructor() {
        super();
        this.name = "samurai";
        this.abilityDuration = 5000;
        this.abilityCooldown = 30000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.3,
            health: 1.3,
            speed: 0.75,
            scale: 1,
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
            healAmount: 1,
            scale: 1.25,
            power: 1,
            damageCooldown: 2,
            damage: 2,
            resistance: 0.25,
            speed: 1.5,
        };
    }
}
module.exports = Samurai;
