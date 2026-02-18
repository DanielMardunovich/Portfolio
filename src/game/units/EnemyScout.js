import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Small example enemy unit
export default class EnemyScout extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "enemy",
      sprite: opts.sprite || { sx: 16, sy: 8 },
      hp: opts.hp ?? 8,
      atk: opts.atk ?? 2,
      move: opts.move ?? 5,
      range: opts.range ?? 1,
      editorShowInfo: false
    });
  }
}

// register this enemy so it can be spawned by type name
registerUnitType("EnemyScout", EnemyScout);
