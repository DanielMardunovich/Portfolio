import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class CoffeeShopProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || "CoffeeShopGameImages/UeManeq.png",
      hp: opts.hp ?? 3,
      atk: opts.atk ?? 5,
      move: opts.move ?? 7,
      range: opts.range ?? 2,
      images: opts.images || [
        "CoffeeShopGameImages/Slide1.png",
        "CoffeeShopGameImages/Slide2.png",
        "CoffeeShopGameImages/Slide3.png",
        "CoffeeShopGameImages/Slide4.png",
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
          itchUrl: opts.itchUrl,
        description: `This is a reusable GOAP (Goal-Oriented Action Planning) framework built in Unreal Engine, designed to power believable AI behaviour across multiple game genres. The system is currently deployed in a coffeeshop simulation where AI agents autonomously enter a store, evaluate their needs, and plan sequences of actions — such as queuing, ordering, and waiting — based on their current world state.\n
The framework is built around a data-driven philosophy. Actions and goals are defined entirely as Data Assets, keeping the planner designer-friendly without sacrificing flexibility — procedural preconditions and dynamic costs can be extended in Blueprint without touching C++. At the planning level, an A* search with a Hamming distance heuristic finds optimal action sequences across a multi-typed world state, with async planning support to keep the game thread clear under heavy AI loads.\n
Shared world knowledge is managed through a World Subsystem, giving all agents access to global actor references through a layered fallback — checking assigned state, default knowledge, and tag-based world search in sequence. An AI Manager handles agent registration, activation control, and an object pool system configured entirely through Project Settings, keeping spawn costs low and designer-exposed parameters out of code.\n
The separation between read-only Data Asset templates and mutable per-agent runtime instances ensures no shared state is corrupted at runtime, making the system safe to use across any number of simultaneously active agents.`,
  gif: "CoffeeShopGameImages/GOAPGif.gif",
  process: [
    { src: "CoffeeShopGameImages/GOAPPlanning.png", caption: `Early architecture sketch of the GOAP planning layer and state-driven behavior framework. The diagram outlines goal evaluation, action sequencing, failure handling, and environmental interactions that structured AI decision-making and reactive flow.` },
    { src: "CoffeeShopGameImages/ActionExample.png", caption: `Example action configuration from the GOAP system. This panel defines the “Drink Coffee” action, including cost evaluation, state effects, execution parameters, animation triggers, and completion tags that feed back into the planner’s decision loop.` },
    { src: "CoffeeShopGameImages/ActionCompletedLogic.png", caption: `Blueprint implementation of a GOAP action resolution flow. The graph handles post-action completion events, state updates, object binding, physics toggling, attachment logic, and interaction notifications that synchronize world state with planner outcomes.` }
  ],
  features: [
    {
      title: "GOAP Planner with Hamming Distance Heuristic",
      text: `The core of the system. Uses a min-heap priority queue for O(log n) node selection, Hamming distance as the heuristic across a multi-typed world state, and a closed set to avoid re-exploring equivalent states. Thread-safe via mutex, with async planning support for agents with large action sets.`,
      codeSamples: [
        { label: "MainLoop", filename: "MainLoop.cpp", url: "CoffeeShopCode/Feature1/MainLoop.cpp", lang: "cpp" },
        { label: "Heuristic + Node Comparator", filename: "HNC.cpp", url: "CoffeeShopCode/Feature1/HNC.cpp", lang: "cpp" },
        { label: "Initial Action Sorting", filename: "InitialActionSorting.cpp", url: "CoffeeShopCode/Feature1/InitialActionSorting.cpp", lang: "cpp" },
        { label: "Plan Reconstruction", filename: "PlanReconstruction.cpp", url: "CoffeeShopCode/Feature1/PlanReconstruction.cpp", lang: "cpp" },
      ]
    },
    {
      title: "Multi-Typed World State",
      text: `A typed key-value world state supporting bools, ints, floats, and object references — all hashable for use as closed set keys in the planner. The Satisfies and GetDistanceTo functions drive both goal validation and heuristic calculation cleanly across all four types.`,
      codeSamples: [
        { label: "Statisfy", filename: "Statisfy.cpp", url: "CoffeeShopCode/Feature2/Statisfy.cpp", lang: "cpp" },
        { label: "Hamming Distance", filename: "Hamming.cpp", url: "CoffeeShopCode/Feature2/Hamming.cpp", lang: "cpp" },
        { label: "Hash Function", filename: "HashFunction.cpp", url: "CoffeeShopCode/Feature2/HashFunction.cpp", lang: "cpp" },
      ]
    },
    {
      title: "Data Asset-Driven Actions & Goals",
      text: `Actions and goals are defined entirely as Data Assets, keeping the planner data-driven and designer-friendly. Procedural preconditions are overridable in Blueprint via BlueprintNativeEvent, and actions fire Gameplay Tag events on completion or failure — decoupling execution results from downstream logic.`,
      codeSamples: [
        { label: "Procedural Precondition", filename: "ProceduralPrecondition.cpp", url: "CoffeeShopCode/Feature3/ProceduralPrecondition.cpp", lang: "cpp" },
        { label: "Rich Comparison Operators", filename: "RichComparisonOperators.cpp", url: "CoffeeShopCode/Feature3/RichComparisonOperators.cpp", lang: "cpp" },
        { label: "Goal Self-Invalidation", filename: "GoalSelfInvalidation.cpp", url: "CoffeeShopCode/Feature3/GoalSelfInvalidation.cpp", lang: "cpp" },
        { label: "Gameplay Tag Event Dispatch", filename: "GameplayTagEventDispatch.cpp", url: "CoffeeShopCode/Feature3/GameplayTagEventDispatch.cpp", lang: "cpp" },
      ]
    },
    {
      title: "Shared World Knowledge Subsystem",
      text: `A world subsystem that manages global actor references and shared state across all agents. Supports tag-based actor discovery with caching, per-agent or broadcast assignment, and a layered fallback: assigned state > default knowledge > tag lookup`,
      codeSamples: [
        { label: "Layered Actor Lookup", filename: "LayeredActorLookup.cpp", url: "CoffeeShopCode/Feature4/LayeredActorLookup.cpp", lang: "cpp" },
        { label: "Broadcast Assignment", filename: "BroadcastAssignment.cpp", url: "CoffeeShopCode/Feature4/BroadcastAssignment.cpp", lang: "cpp" },
        { label: "Cached Tag Lookup", filename: "CachedTagLookup.cpp", url: "CoffeeShopCode/Feature4/CachedTagLookup.cpp", lang: "cpp" },
        { label: "Default Knowledge Application", filename: "DefaultKnowledgeApplication.cpp", url: "CoffeeShopCode/Feature4/DefaultKnowledgeApplication.cpp", lang: "cpp" },
      ]
    },
    {
      title: "Shared World Knowledge Subsystem",
      text: `A world subsystem that manages global actor references and shared state across all agents. Supports tag-based actor discovery with caching, per-agent or broadcast assignment, and a layered fallback: assigned state > default knowledge > tag lookup`,
      codeSamples: [
        { label: "Pool Entry Lookup and Spawn", filename: "PoolEntryLookupAndSpawn.cpp", url: "CoffeeShopCode/Feature5/PoolEntryLookupAndSpawn.cpp", lang: "cpp" },
        { label: "Pool Configuration via Developer Settings", filename: "PoolConfiguration.cpp", url: "CoffeeShopCode/Feature5/PoolConfiguration.cpp", lang: "cpp" },
        { label: "Agent Info Tracking", filename: "AgentInfoTracking.cpp", url: "CoffeeShopCode/Feature5/AgentInfoTracking.cpp", lang: "cpp" },
        { label: "State Enum", filename: "StateEnum.cpp", url: "CoffeeShopCode/Feature5/StateEnum.cpp", lang: "cpp" },
      ]
    },
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("CoopCafeManagementGame", CoffeeShopProject);
