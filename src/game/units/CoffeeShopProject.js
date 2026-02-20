import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class CoffeeShopProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || {16 : 3},
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 20,
      move: opts.move ?? 15,
      range: opts.range ?? 3,
      images: opts.images || [
        "CoffeeShopGameImages/Slide1.png",
      ],
      info: opts.info || {
  name: "CO-OP CAFÉ MANAGEMENT GAME",
  role: "AI Engineer",
  summary: "Temporary description",
         details: [
           { label: "Date", value: "Oct 2025" },
           { label: "Duration", value: "In progress" },
           { label: "Position", value: "Anything to do with AI" },
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
      title: "GOAP Planner with Hamming Distance Heuristic",
      text: `The core of the system. Uses a min-heap priority queue for O(log n) node selection, Hamming distance as the heuristic across a multi-typed world state, and a closed set to avoid re-exploring equivalent states. Thread-safe via mutex, with async planning support for agents with large action sets.`,
      codeSamples: [
        { label: "MainLoop", filename: "MainLoop.cpp", url: "ThrallCode/MainLoop.cpp", lang: "cpp" },
      ]
    }
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("CoopCafeManagementGame", CoffeeShopProject);
