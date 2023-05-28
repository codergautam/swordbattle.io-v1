const Evolution = require("./Evolution");
const Samurai = require("./Samurai");
const Lumberjack = require("./Lumberjack");
class Warrior extends Evolution {
    constructor() {
        super();
        this.name = "warrior";
        this.abilityDuration = 5000;
        this.abilityCooldown = 100000;
        this.subEvolutions = [30000, new Samurai(), new Lumberjack()];
    }
    default() {
        return {
            maxHealth: 1.05,
            health: 1.05,
            speed: 0.9,
            scale: 1.15,
            power: 1,
            resistance: 3,
            damage: 1.5,
            damageCooldown: 1,
            healAmount: 1.5,
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 3,
            scale: 2.5,
            power: 5,
            damageCooldown: 0.7,
            damage: 2,
            resistance: 5,
            speed: 2.7,
        };
    }
}
module.exports = Warrior;