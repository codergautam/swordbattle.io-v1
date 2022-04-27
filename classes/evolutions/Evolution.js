// A base class for representing an evolution.

class Evolution {
    constructor() {
        this.name = "";
        this.abilityDuration = 0;
        this.abilityCooldown = 0;
        this.subEvolutions = [];
    }

    applyTo(player) {
        player.evolution = this.name;
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