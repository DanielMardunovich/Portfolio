import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class ThrallProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || "Icons/linkedinpixel.png",
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 20,
      move: opts.move ?? 15,
      range: opts.range ?? 3,
      images: opts.images || [
        "GameLogos/Thrall.png",
        "ThrallImages/CourtYard.png",
        "ThrallImages/Market.png",
        "ThrallImages/Soldier.png"
      ],
      info: opts.info || {
  name: "Thrall",
  role: "AI Engineer",
  summary: "Developed core AI systems for crowd navigation and behavior using state trees in a large-scale emergent combat experience.",
         // `details` can be an array of { label, value } to control the Project Details card
         details: [
           { label: "Date", value: "May 2025" },
           { label: "Duration", value: "7 Weeks" },
           { label: "Position", value: "AI Engineer" },
           { label: "Languages", value: "C++" },
           { label: "Engine", value: "Unreal" },
         ],
          itchUrl: opts.itchUrl || "https://futuregames.itch.io/thrall",
        description: `Thrall is a first-person action game where the player embodies the fractured spirit of a fallen king, possessing enemies and uncovering lost memories through dynamic combat encounters.\n
As the AI Engineer, I designed and implemented a scalable AI architecture using Unreal Engine State Trees to support complex, hierarchical behavior. The system enables enemies to react dynamically in combat while maintaining clear, maintainable logic structures.\n
To support large-scale encounters, I implemented crowd-based navigation with local avoidance to ensure smooth multi-agent movement without collision artifacts. I also developed an object pooling system to reduce runtime allocations and optimize performance, allowing the game to sustain high AI counts while maintaining stable frame rates.`,
  gif: "ThrallImages/ThrallGif.gif",
  process: [
    { src: "ThrallImages/StateTreePlanning.png", caption: `Early architecture sketch of the AI State Tree framework. The diagram maps high-level behavioral states, transition conditions, and combat flow logic that structured enemy decision-making.` },
    { src: "ThrallImages/AIStateTreeImplementation.png", caption: `AI State Tree implementation detailing structured behavior nodes and condition-based transitions. The system enables modular, hierarchical decision-making while maintaining clarity and scalability.` },
    { src: "ThrallImages/AIControllerBlueprint.png", caption: `AI Controller Blueprint integrating Unreal’s AI Perception with the State Tree framework. Stimulus events are validated, processed, and translated into state transitions, ensuring responsive and structured combat behavior.` }
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
    {
      title: "AI Brain Subsystem",
      text: "Global coordination system that manages AI targeting and combat pacing. Provides a shared player target reference and uses an attack token system to limit how many melee or ranged enemies can attack simultaneously — preventing overcrowding and ensuring controlled, readable combat flow.",
      codeSamples: [  { label: ".cpp", filename: "SCR_AIBrainSubsystem.cpp", url: "ThrallCode/SCR_AIBrainSubsystem.cpp", lang: "cpp" },
                      { label: ".h", filename: "SCR_AIBrainSubsystem.h", url: "ThrallCode/SCR_AIBrainSubsystem.h", lang: "cpp" }
       ]
    },
    {
      title: "Object Pooling System",
      text: "Reusable actor pooling system that pre-spawns and manages inactive actors to eliminate runtime spawn/destruction costs. Supports dynamic top-ups and round-robin retrieval, enabling efficient AI and gameplay object reuse while maintaining stable performance during high-intensity encounters.",
      codeSamples: [ { label: ".h", filename: "SCR_ObjectPool.h", url: "ThrallCode/SCR_ObjectPool.h", lang: "cpp" },
                      { label: ".cpp", filename: "SCR_ObjectPool.cpp", url: "ThrallCode/SCR_ObjectPool.cpp", lang: "cpp" }
       ]
    }
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("ThrallProject", ThrallProject);
