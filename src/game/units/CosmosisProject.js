import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class CosmosisProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || "Units/Cosmosis2.png",
      hp: opts.hp ?? 5,
      atk: opts.atk ?? 6,
      move: opts.move ?? 7,
      range: opts.range ?? 3,
      images: opts.images || [
        "GameLogos/Cosmosis.png",
        "CosmosisImages/Slide1.png",
        "CosmosisImages/Slide2.png",
        "CosmosisImages/Slide3.png",
      ],
      info: opts.info || {
  name: "Cosmosis",
  role: "AI Engineer",
  summary: `Designed the backend architecture and implemented a scalable procedural map generation system to support dynamic gameplay scenarios.`,
         // `details` can be an array of { label, value } to control the Project Details card
         details: [
           { label: "Date", value: "Oct 2025" },
           { label: "Duration", value: "4 Weeks" },
           { label: "Position", value: "AI Engineer" },
           { label: "Languages", value: "C++" },
           { label: "Engine", value: "Unreal" },
         ],
          itchUrl: opts.itchUrl || "https://futuregames.itch.io/cosmosis",
        description: `Cosmosis is a fast-paced multiplayer action experience centered around cooperative combat and dynamic encounters. Players navigate high-intensity scenarios where moment-to-moment decision-making and synchronized gameplay are key to survival.\n
As the AI Programmer, I designed and implemented a spatial partitioning system to manage enemy awareness and group behaviour at scale. Enemies share perception — when one agent senses a player, nearby agents are queried through a tile-based lookup and alerted in unison, producing emergent group responses without a centralised coordinator.\n
All AI systems were built with full network replication in mind. Behaviour is driven server-authoritatively through StateTree, with synchronized world state, tile-tracked movement, and a flexible spawning system supporting single, interval, and bulk spawn modes under multiplayer conditions.`,
  gif: "CosmosisImages/CosmosisGif.gif",
  process: [
    { src: "CosmosisImages/AIPlanning.png", caption: `My first attempt at implementing a GOAP-based AI system.
This early design explored how world state data, attack components, and goal evaluation could integrate into a flexible planning framework—marking the transition from traditional state trees to goal-driven decision making.` },
    { src: "CosmosisImages/StateTreeExample.png", caption: `Designed a hierarchical State Tree to control AI behavior transitions from Idle to Combat. The system evaluates world state conditions, selects appropriate attack branches, and manages execution flow through explicit success/failure transitions, enabling structured yet flexible combat logic.` },
    { src: "CosmosisImages/DeathMontageBlueprint.png", caption: `Built a replicated death sequence in Blueprint — a server RPC triggers a multicast animation, keeping visual state consistent across all clients before the actor is cleaned up.` }
  ],
  features: [
    {
      title: "Spatial AI Lookup System",
      text: "TA world-space partitioning subsystem that maps 3D positions to discrete tiles using integer vector keys. Supports O(1) tile queries, radius-based AI neighbour lookups, and automatic tile migration as agents move — enabling efficient large-scale AI awareness without expensive distance checks across all agents.",
      codeSamples: [
        { label: "Tile Mapping", filename: "TileMapping.cpp", url: "CosmosisCode/TileMapping.cpp", lang: "cpp" },
        { label: "World To Tile", filename: "WorldToTile.cpp", url: "CosmosisCode/WorldToTile.cpp", lang: "cpp" },
        { label: "Radius Query", filename: "RadiusQuery.cpp", url: "CosmosisCode/RadiusQuery.cpp", lang: "cpp" },
        { label: "Tile Migration", filename: "TileMigration.cpp", url: "CosmosisCode/TileMigration.cpp", lang: "cpp" }
      ]
    },
    {
      title: "Reactive Group Aggro Propagation",
      text: "When any AI senses a player, it queries the tile system for all nearby agents and broadcasts an aggro state change to each one via StateTree events. This produces emergent group behaviour — nearby enemies \"wake up\" together — without a centralised coordinator or expensive global queries.",
      codeSamples: [
        { label: "Core Propagation Block", filename: "CorePropogationBlock.cpp", url: "CosmosisCode/CorePropogationBlock.cpp", lang: "cpp" },
        { label: "State Transition Guard", filename: "StateTransitionGuard.cpp", url: "CosmosisCode/StateTransitionGuard.cpp", lang: "cpp" },
        { label: "StateTree Event Dispatch", filename: "StateTreeEventDispatch.cpp", url: "CosmosisCode/StateTreeEventDispatch.cpp", lang: "cpp" }
      ]
    },
    {
      title: "Flexible Spawner with Three Spawn Modes",
      text: "A server-authoritative spawner supporting single, interval-based, and chunk spawning via a clean enum-driven switch. Spawn delay, interval, and hunt-on-spawn behaviour are all configurable per instance, with editor property reflection to conditionally show relevant fields.",
      codeSamples: [
        { label: "Three-Mode Spawn Switch", filename: "ThreeModeSpawnSwitch.cpp", url: "CosmosisCode/ThreeModeSpawnSwitch.cpp", lang: "cpp" },
        { label: "Self-Terminating Interval Spawner", filename: "SelfTerminatingIntervalSpawner.cpp", url: "CosmosisCode/SelfTerminatingIntervalSpawner.cpp", lang: "cpp" },
        { label: "Editor Property Reflection", filename: "EditorPropertyReflection.cpp", url: "CosmosisCode/EditorPropertyReflection.cpp", lang: "cpp" }
      ]
    }
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("CosmosisProject", CosmosisProject);
