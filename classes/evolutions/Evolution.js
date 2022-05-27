// A base class for representing an evolution.

class Evolution {
    constructor() {
        this.name = "";
        this.abilityDuration = 0;
        this.abilityCooldown = 0;
        this.subEvolutions = [];
    }
  
    default() {
    return {
        speed: undefined,
        scale: undefined,
        power: undefined,
        resistance: undefined,
        damage: undefined,
        hitCooldown: undefined,
    };   
    }

    ability() {
        return {
            speed: undefined,
            scale: undefined,
            power: undefined,
            resistance: undefined,
            damage: undefined,
            hitCooldown: undefined,
        };
    }
}

module.exports = Evolution;