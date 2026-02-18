import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class BulletDanceProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || {16 : 6}, // default to soldier sprite if not provided
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 20,
      move: opts.move ?? 15,
      range: opts.range ?? 3,
      images: opts.images || [
        "GameLogos/Thrall.png"
      ],
      info: opts.info || {
  name: "Bullet Dance",
  role: "Backend and Player programmer, UI Designer",
  summary: "",
         // `details` can be an array of { label, value } to control the Project Details card
         details: [
           { label: "Date", value: "April 2022" },
           { label: "Duration", value: "8 Weeks" },
           { label: "Position", value: "Backend and Player programmer, UI Designer" },
           { label: "Languages", value: "C#" },
           { label: "Engine", value: "Unity" },
         ],
          itchUrl: opts.itchUrl || "https://mattias0004.itch.io/bullet-dance",
        description: `temp temp temp`,
  gif: "",
  process: [
    { src: "ThrallImages/StateTreePlanning.png", caption: `Temp` },
    { src: "ThrallImages/AIStateTreeImplementation.png", caption: `Temp` },
    { src: "ThrallImages/AIControllerBlueprint.png", caption: `Temp` }
  ],
  features: [
    {
      title: "Temp system",
      text: "Temp description",
      codeSamples: [
        { label: ".h", filename: "AIManager.h", url: "ThrallCode/AIManager.h", lang: "cpp" },
        { label: ".cpp", filename: "AIManager.cpp", url: "ThrallCode/AIManager.cpp", lang: "cpp" }
      ]
    }
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("BulletDanceProject", BulletDanceProject);
