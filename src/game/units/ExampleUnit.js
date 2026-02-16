import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class ExampleSoldier extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || { sx: 16, sy: 5 },
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 20,
      move: opts.move ?? 15,
      range: opts.range ?? 3,
      images: opts.images || [
        "/GameLogos/logo1.png",
        "/GameLogos/logo2.png",
        "/GameLogos/logo2.png",
      ],
      info: opts.info || {
        name: "Daniel",
        headline: "The coolest dude in the world",
        text: `Hi, I'm Daniel and I like to code cool games and make awesome portfolios!`,
      }
    });
  }
}

// register this example so it can be created by type name
registerUnitType("Daniel", ExampleSoldier);
