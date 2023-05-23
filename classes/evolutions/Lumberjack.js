

const Evolution = require("./Evolution");
class Lumberjack extends Evolution {
    constructor() {
        super();
        this.name = "lumberjack";
        this.abilityDuration = 5000;
        this.abilityCooldown = 55000;
        this.subEvolutions = [];
    }
    default() {
        return {
            maxHealth: 1.3,
            health: 1.3,
            speed: 1,
            scale: 1.1,
            power: 1.3,
            resistance: 1.2,
            damage: 1.6,
            damageCooldown: 1.3,
            healAmount: 1.5,
            healWait: 2.5
        };
    }
    ability() {
        return {
            healWait: 2,
            healAmount: 1.5,
            scale: 1.2,
            power: 1.5,
            damageCooldown: 3,
            resistance: 1,
            damage: 4,
            speed: 1.2,
        };
    }
}
module.exports = Lumberjack;
