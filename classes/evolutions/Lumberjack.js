

const Archer = require("./Archer");
const BodyBuilder = require("./BodyBuilder");
const Evolution = require("./Evolution");
class Lumberjack extends Evolution {
    constructor() {
        super();
        this.name = "lumberjack";
        this.abilityDuration = 5000;
        this.abilityCooldown = 55000;
        this.subEvolutions = [4000, new Archer(), new BodyBuilder()];
    }
    default() {
        return {
            maxHealth: 0.6,
            health: 0.6,
            speed: 1,
            scale: 1.1,
            power: 1.3,
            resistance: 1.2,
            damage: 1.8,
            damageCooldown: 1.5,
            healAmount: 1.5,
            healWait: 2.5,
            throwCooldown: 0.5
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
            throwCooldown: 0.2
        };
    }
}
module.exports = Lumberjack;
