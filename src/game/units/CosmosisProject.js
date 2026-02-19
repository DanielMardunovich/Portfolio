import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class CosmosisProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || {16 : 5},
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 20,
      move: opts.move ?? 15,
      range: opts.range ?? 3,
      images: opts.images || [
        "GameLogos/Cosmosis.png",
        "CosmosisImages/CourtYard.png"
      ],
      info: opts.info || {
  name: "Cosmosis",
  role: "AI Engineer",
  summary: "Temporary description",
         // `details` can be an array of { label, value } to control the Project Details card
         details: [
           { label: "Date", value: "Oct 2025" },
           { label: "Duration", value: "4 Weeks" },
           { label: "Position", value: "AI Engineer" },
           { label: "Languages", value: "C++" },
           { label: "Engine", value: "Unreal" },
         ],
          itchUrl: opts.itchUrl || "https://futuregames.itch.io/cosmosis",
        description: `Temporary description.`,
  gif: "",
  process: [
    { src: "", caption: `Temp image` },
    { src: "", caption: `Temp image` },
    { src: "", caption: `Temp image` }
  ],
  features: [
    {
      title: "Temporary Feature",
      text: "Temporary description of a feature.",
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
registerUnitType("CosmosisProject", CosmosisProject);
