import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class ExampleSoldier extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "enemy",
      sprite: opts.sprite || { sx: 16, sy: 6 },
      hp: opts.hp ?? 1,
      atk: opts.atk ?? 1,
      move: opts.move ?? 1,
      range: opts.range ?? 3,
      images: opts.images || [
        "/GameLogos/logo1.png",
        "/GameLogos/logo2.png",
        "/GameLogos/logo2.png",
      ],
      info: opts.info || {
        name: "Mohammed",
        headline: "Im a cool dood, just a lil boi boi",
        text: `Hi, im mohammed and im scared of small birds`,
      }
    });
  }
}

// register this example so it can be created by type name
registerUnitType("Mohammed", ExampleSoldier);
