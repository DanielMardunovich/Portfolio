import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Small example enemy unit
export default class Gmail extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "enemy",
      sprite: opts.sprite || "Icons/GmailPixel.png",
      hp: opts.hp ?? 8,
      atk: opts.atk ?? 2,
      move: opts.move ?? 5,
      range: opts.range ?? 1,
      editorShowInfo: opts.editorShowInfo !== undefined ? !!opts.editorShowInfo : false,
      info: opts.info || {
        name: "Mardunovich@gmail.com",
        links: [
          { label: "Gmail", url: "mailto:mardunovich@gmail.com" }
        ]
      },
      editorShowInfo: false
    });
  }
}

// register this enemy so it can be spawned by type name
registerUnitType("Gmail", Gmail);
