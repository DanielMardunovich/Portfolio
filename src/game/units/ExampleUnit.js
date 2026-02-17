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
        name: "ExampleSoldier",
        role: "Example project role",
        summary: "Built an AI behavior system for large-scale unit coordination.",
        description: `A concise description of the project and goals. This project explores multi-agent planning and emergent behaviors in large simulated battles.`,
        responsibilities: [
          { title: "Navigation", text: "Designed pathfinding and local avoidance for thousands of agents." },
          { title: "Decision Systems", text: "Implemented hierarchical task planning and behavior trees." },
          { title: "Optimization", text: "Profiled and optimized systems for real-time performance." }
        ],
        gif: "/GameLogos/demo.gif",
        process: [
          { src: "/GameLogos/process1.png", caption: "Early planning sketches" },
          { src: "/GameLogos/process2.png", caption: "State machine diagrams" },
          { src: "/GameLogos/process3.png", caption: "Prototype flow" }
        ],
        features: [
          { title: "Scalable Pathfinding", text: "Custom grid-based path manager for hundreds of agents." },
          { title: "Behavior Trees", text: "Reusable behavior tree nodes and debugging tools." },
          { title: "Blackboard System", text: "Shared context for group tactics." }
        ]
      }
    });
  }
}

// register this example so it can be created by type name
registerUnitType("ExampleSoldier", ExampleSoldier);
