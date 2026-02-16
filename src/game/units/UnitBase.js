import { FACTION, UNIT_SPRITES } from "../units.js";

// Base class for unit definitions. Extend this to create reusable unit types
export default class UnitBase {
  constructor({
    id,
    faction = FACTION.FRIENDLY,
    sprite = null,
    hp = 10,
    atk = 3,
    move = 4,
    range = 1,
    images = [], // left column images for info panel (stacked)
    info = { headline: "", text: "" } // right column info for info panel
  } = {}) {
    this.id = id;
    this.faction = faction;
    this.sprite = sprite || UNIT_SPRITES.FRIENDLY_SOLDIER;
    this.hp = hp;
    this.atk = atk;
    this.move = move;
    this.range = range;
    this.images = images;
    this.info = info;
  }
}
