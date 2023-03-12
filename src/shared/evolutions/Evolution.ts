// A base class for representing an evolution.

export default class Evolution {
  name: string;
  abilityDuration: number;
  abilityCooldown: number;
  subEvolutions: any[];
  constructor() {
      this.name = "";
      this.abilityDuration = 0;
      this.abilityCooldown = 0;
      this.subEvolutions = [];
  }

  default() {
  }

  ability() {
  }
}