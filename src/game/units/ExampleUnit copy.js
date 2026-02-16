import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class ExampleSoldier extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "enemy",
      sprite: opts.sprite || { sx: 16, sy: 5 },
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 4,
      move: opts.move ?? 3,
      range: opts.range ?? 3,
      images: opts.images || [
        "/GameLogos/logo1.png",
        "/GameLogos/logo2.png",
        "/GameLogos/logo2.png",
      ],
      info: opts.info || {
        name: "cheeseball",
        headline: "Project name or whatever",
        text: `Hello, this is the info text for this unit. You can provide any description or details about the unit here, and it will show up in the info panel when the unit is selected. You can also include multiple images that will be displayed in the left column of the info panel. This is just an example unit to demonstrate how to create a new unit type by extending the UnitBase class and registering it with a unique type name.`,
      }
    });
  }
}

// register this example so it can be created by type name
registerUnitType("humbug_2", ExampleSoldier);
