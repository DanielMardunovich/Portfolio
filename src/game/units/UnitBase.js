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
    info = { headline: "", text: "" }, // right column info for info panel
    // Editor-only flag: whether this unit should show the project/info button
    // Defaults: friendlies = true, enemies = false
    editorShowInfo
  } = {}) {
    this.id = id;
    this.faction = faction;
    // Allow sprite to be provided either as a sprite-sheet coordinate ({sx, sy})
    // or as a string filepath ("/path/to/image.png"). Normalize to an object:
    // - { sx, sy } for tileset sprites
    // - { src: string } for standalone images
    if (typeof sprite === "string") {
      this.sprite = { src: sprite };
    } else if (sprite && (sprite.sx !== undefined || sprite.sy !== undefined)) {
      this.sprite = sprite;
    } else {
      this.sprite = UNIT_SPRITES.FRIENDLY_SOLDIER;
    }
    this.hp = hp;
    this.atk = atk;
    this.move = move;
    this.range = range;
    this.images = images;
    this.info = info;
    this.editorShowInfo = (editorShowInfo !== undefined) ? !!editorShowInfo : (faction === FACTION.FRIENDLY);
  }
}
