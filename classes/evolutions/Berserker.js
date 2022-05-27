const Evolution = require("./Evolution");
class Berserker extends Evolution {
    constructor() {
        super();
        this.name = "berserker";
        this.abilityDuration = 10000;
        this.abilityCooldown = 60000;
        this.subEvolutions = [];
    }
    default() {
        return {
            speed: 1.25,
            power: 1.5,
            resistance: 0.9,
            damage: 1.1,
            danageCooldown: 0.8,
        };
    }
    ability() {
        return {
            healWait: 0.5,
            healAmount: 1.25,
            speed: 2,
            power: 2,
            resistance: 1.5,
            damage: 3,
            hitCooldown: 0.2,
        };
    }
}
module.exports = Berserker;
