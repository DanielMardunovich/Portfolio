import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Small example enemy unit
export default class ItchIo extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "enemy",
      sprite: opts.sprite || "Icons/Itchiopixel.png",
      hp: opts.hp ?? 8,
      atk: opts.atk ?? 2,
      move: opts.move ?? 5,
      range: opts.range ?? 1,
      info: opts.info || {
        name: "ItchIo",
        links: [
          { label: "ItchIo", url: "https://sgtcatt.itch.io" }
        ]
      },
      editorShowInfo: false
    });
  }
}

// register this enemy so it can be spawned by type name
registerUnitType("ItchIo", ItchIo);
