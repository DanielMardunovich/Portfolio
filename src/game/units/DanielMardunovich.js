import UnitBase from "./UnitBase.js";
import { registerUnitType, FACTION } from "../units.js";

// Example unit showing defaults for a derived type.
export default class DanielMardunovich extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || FACTION.ENEMY,
      sprite: opts.sprite || "Me/PixelMe.png",
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 20,
      move: opts.move ?? 15,
      range: opts.range ?? 3,
      images: opts.images || [
        "Me/BarThingy.png",
      ],
      // Allow opening the editor/info panel even though this unit is an enemy
      editorShowInfo: opts.editorShowInfo !== undefined ? !!opts.editorShowInfo : true,
      info: opts.info || {
  name: "Daniel Mardunovich",
  role: "AI Engineer",
  summary: "Skilled programmer with a passion for game development and a knack for solving complex problems with elegant code.",
         // `details` can be an array of { label, value } to control the Project Details card
         details: [
           { label: "Programming experience", value: "7+ years" },
           { label: "Position", value: "Gameplay programmer" },
           { label: "Languages", value: "C++/C#/Java/JS" },
           { label: "Engine", value: "Unreal/Unity" },
         ],
          itchUrl: opts.itchUrl || "Me/ENGCVDanielMardunovich.pdf",
        description: ``,
  gif: "Me/wide_daniel.gif",
  process: [
    { src: "Me/CoolPixel.png", caption: `Me but pixelated` },
    { src: "Me/Sissi1.jpg", caption: `My lovely dog Sinestra of Fortis (Or Sissi for short)` },
    { src: "Me/PriceWinner.jpg", caption: `Me on stage after winning students choice award for the game project BulletDance` }
  ],
  features: [
    {
      title: "AI Manager System",
      text: "Centralized system controlling enemy spawning, activation states, and combat flow. Dynamically selects spawn points (closest, furthest, random, or all), manages active/inactive agent pools, triggers horde escalation, and handles room-clear logic with reward drops — ensuring scalable encounters and optimized AI lifecycle management.",
      codeSamples: [
        { label: ".h", filename: "AIManager.h", url: "ThrallCode/AIManager.h", lang: "cpp" },
        { label: ".cpp", filename: "AIManager.cpp", url: "ThrallCode/AIManager.cpp", lang: "cpp" }
      ]
    },
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("DanielMardunovich", DanielMardunovich);
