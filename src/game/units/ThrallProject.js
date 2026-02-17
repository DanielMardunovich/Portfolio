import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class ThrallProject extends UnitBase {
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
        "GameLogos/Thrall.png",
        "GameLogos/Thrall.png",
        "GameLogos/Thrall.png"
      ],
      info: opts.info || {
  name: "Thrall",
  role: "AI Engineer",
  summary: "Developed core AI systems for crowd navigation and behavior using state trees in a large-scale emergent combat experience.",
  description: `Thrall is a first-person action game where the player embodies the fractured spirit of a fallen king, possessing enemies and uncovering lost memories through dynamic combat encounters.\n
As the AI Engineer, I designed and implemented a scalable AI architecture using Unreal Engine State Trees to support complex, hierarchical behavior. The system enables enemies to react dynamically in combat while maintaining clear, maintainable logic structures.\n
To support large-scale encounters, I implemented crowd-based navigation with local avoidance to ensure smooth multi-agent movement without collision artifacts. I also developed an object pooling system to reduce runtime allocations and optimize performance, allowing the game to sustain high AI counts while maintaining stable frame rates.`,
  responsibilities: [
    { title: "AI Behavior System", text: "Built a state-tree–based AI architecture to achieve complex, hierarchical agent behavior." },
    { title: "Navigation & Avoidance", text: "Implemented crowd navigation so enemies avoid each other and traverse levels smoothly." },
    { title: "Performance Optimization", text: "Created an object pool and optimized AI routines for real-time performance with many agents." }
  ],
  gif: "ThrallImages/ThrallAIGif.gif",
  process: [
    { src: "ThrallImages/StateTreePlanning.png", caption: "AI architecture and planning sketches" },
    { src: "ThrallImages/AIStateTreeImplementation.png", caption: "State tree for enemy behaviors" },
    { src: "ThrallImages/process3.png", caption: "Prototype tests of crowd navigation and avoidance" }
  ],
  features: [
    { title: "Emergent Combat", text: "Enemies adapt their behaviors during battles based on state trees and shared context." },
    { title: "Scalable Navigation", text: "Crowd AI that prevents agents from colliding and supports large engagements." },
    { title: "Optimized AI Pooling", text: "Object pooling system for efficient instantiation and reuse of AI agents in combat scenarios." }
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("ThrallProject", ThrallProject);
