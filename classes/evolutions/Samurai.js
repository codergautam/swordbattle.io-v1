const Evolution = require("./Evolution");
const Archer = require("./Archer");
const BodyBuilder = require("./BodyBuilder");
class Samurai extends Evolution {
    constructor() {
        super();
        this.name = "rook";
        this.abilityDuration = 8000;
        this.abilityCooldown = 50000;
        this.subEvolutions = [40000, new Archer(), new BodyBuilder()];
    }
    default() {
        return {
            maxHealth: 1.6,
            health: 1.6,
            speed: 1.2,
            scale: 1.3,
            power: 1,
            resistance: 5.5,
            damage: 1.6,
            damageCooldown: 1.3,
            healAmount: 1.5,
            healWait: 2
        };
    }
    ability() {
        return {
            healWait: 0,
            healAmount: 1.5,
            scale: 1.6,
            power: 1.5,
            damageCooldown: 0.9,
            resistance: 1,
            damage: 1.2,
            speed: 1.5,
        };
    }
}
module.exports = Samurai;
