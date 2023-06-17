const Juggernaut = require("./Juggernaut");
const Evolution = require("./Evolution");
const Fisherman = require("./Fisherman");
class Lumberjack extends Evolution {
    constructor() {
        super();
        this.name = "lumberjack";
        this.abilityDuration = 5000;
        this.abilityCooldown = 40000;
        this.subEvolutions = [50000, new Fisherman(), new Juggernaut()];
    }
    default() {
        return {
            maxHealth: 0.6,
            health: 0.6,
            speed: 1,
            scale: 1.2,
            power: 1.3,
            resistance: 1.2,
            damage: 2.2,
            damageCooldown: 1.8,
            healAmount: 1.5,
            healWait: 1.7,
            throwCooldown: 0.4
        };
    }
    ability() {
        return {
            healWait: 2,
            healAmount: 1.5,
            scale: 1.2,
            power: 1.5,
            damageCooldown: 1.25,
            resistance: 1,
            damage: 4,
            speed: 1.2,
            throwCooldown: 0.3,
            throwDamageMultiplier: 0.1
        };
    }
}
module.exports = Lumberjack;
