import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class DanielProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || "Units/DanielOrb.png",
      hp: opts.hp ?? 5,
      atk: opts.atk ?? 3,
      move: opts.move ?? 5,
      range: opts.range ?? 2,
      images: opts.images || [
        "GameLogos/DanielDanielDanielDaniel.png",
        "DanielImages/PistolImage.jpg",
        "DanielImages/Cube.jpg",
        "DanielImages/Hit.jpg",
      ],
      info: opts.info || {
        name: "DanielDanielDanielDaniel",
        role: "Backend / Systems Programmer",
        summary: "Developed the backend architecture and implemented the map generation system for the project.",
        details: [
           { label: "Date", value: "May 2025" },
           { label: "Duration", value: "4 Weeks" },
           { label: "Position", value: "Backend / Systems Programmer" },
           { label: "Languages", value: "C#" },
           { label: "Engine", value: "Unity" },
         ],
         itchUrl: opts.itchUrl || "https://futuregames.itch.io/daniel-daniel-daniel-daniel",
        description: `Daniel Daniel Daniel Daniel is a cyberpunk roguelike first-person shooter where players progress through procedurally generated floors, battling enemies and navigating dynamically assembled environments in each run.

As the Backend & Systems Programmer, I designed and implemented the procedural level generation pipeline and core runtime architecture in Unity to support replayability and scalable gameplay flow.

I developed a grid-based procedural generation system that constructs interconnected room layouts at runtime. The system evaluates spatial adjacency to determine room types (single-connection, multi-connection, L-shaped, I-shaped, etc.), selects valid prefabs based on connection rules, and dynamically rotates rooms to ensure proper door alignment and seamless navigation. This guarantees structurally coherent levels while maintaining high variation between runs.

To support game flow and modular system interaction, I implemented a custom state machine framework with additive scene loading, enabling clean transitions between main menu, loading states, and gameplay. I also developed a centralized event system to decouple gameplay systems, allowing rooms, game states, and progression logic to communicate efficiently without tight dependencies.

Additionally, I implemented runtime object placement systems for spawning interactive elements such as chests in valid locations within generated rooms, ensuring both randomness and gameplay consistency.

The result is a flexible backend architecture that supports procedural generation, modular gameplay systems, and scalable expansion for future features while maintaining runtime stability and performance.`,
        gif: "DanielImages/DanielGif.gif",
        process: [
          { src: "DanielImages/MapGeneration.png", caption: "A custom grid-based exploration algorithm that expands rooms through directional sampling while validating placement boundaries. The system guarantees connected and walkable layouts while maintaining high variation between runs." },
          { src: "DanielImages/Chest.png", caption: "Randomized spawning system for interactive objects (e.g., chests) using validated spawn points within generated rooms. Balances unpredictability with gameplay constraints." },
          { src: "DanielImages/EventManager.png", caption: "Centralized event manager enabling decoupled communication between gameplay systems. Supports room completion, floor transitions, player state changes, and game progression logic." },
          { src: "DanielImages/Diagram.png", caption: "Core systems built using a singleton-based manager structure with clear separation of concerns. Designed for maintainability, scalability, and future feature expansion." }
        ],
        features: [
          {
      title: "Procedural Level Generation",
      text: "Designed and implemented a modular grid-based procedural generation system that constructs fully connected dungeon layouts at runtime. The system separates layout generation, structural classification, runtime assembly, and validation into clearly defined stages to ensure scalability and maintainability.",
      codeSamples: [
        { label: "Grid Expansion", filename: "LayoutNExpanse.cs", url: "DanielCode/ProcLevelGen/LayoutNExpanse.cs", lang: "csharp" },
        { label: "Room Classification", filename: "RoomClassification.cs", url: "DanielCode/ProcLevelGen/RoomClassification.cs", lang: "csharp" },
        { label: "Runtime Assembly Pipeline", filename: "RunAssPip.cs", url: "DanielCode/ProcLevelGen/RunAssPip.cs", lang: "csharp" },
        { label: "Door Validation & Correction", filename: "DoorValid.cs", url: "DanielCode/ProcLevelGen/DoorValid.cs", lang: "csharp" }
          ]
        },

        {
      title: "Event-Driven Architecture",
      text: "Implemented a centralized event dispatching system to decouple gameplay systems and enforce clear communication contracts between game flow, level progression, and runtime state changes. The architecture uses strongly typed C# events to eliminate hard references between systems, improving scalability and maintainability.",
      codeSamples: [
        { label: "EventManager.cs", filename: "EventManager.cs", url: "DanielCode/Event/EventManager.cs", lang: "csharp" },
          ]
        },

        {
      title: "Custom State Machine Framework",
      text: "Developed a lightweight state machine framework supporting dynamic state registration and clean lifecycle transitions. Designed to scale without manual state wiring.",
      codeSamples: [
        { label: "Dynamic state registration", filename: "StateRegistration.cs", url: "DanielCode/StateMachine/StateRegistration.cs", lang: "csharp" },
        { label: "State Switching Logic", filename: "StateSwitching.cs", url: "DanielCode/StateMachine/StateSwitching.cs", lang: "csharp" },
          ]
        },
        ]
      }
    });
  }
}

// register this example so it can be created by type name
registerUnitType("DanielProject", DanielProject);
