import UnitBase from "./UnitBase.js";
import { registerUnitType } from "../units.js";

// Example unit showing defaults for a derived type.
export default class BulletDanceProject extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || "friendly",
      sprite: opts.sprite || "Units/BulletDance.png", // default to soldier sprite if not provided
      hp: opts.hp ?? 20,
      atk: opts.atk ?? 20,
      move: opts.move ?? 15,
      range: opts.range ?? 3,
      images: opts.images || [
        "GameLogos/BD.png",
        "BulletDanceImages/Running.png",
        "BulletDanceImages/Conversation.png",
        "BulletDanceImages/Score.png",
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
        description: `Bullet Dance is a fast-paced top-down arcade shooter focused on precision movement and reactive combat within dense projectile encounters. The player navigates intense bullet patterns while using timed swings and positioning to control space and survive escalating pressure.

As the gameplay programmer, I designed and implemented the full player character architecture, emphasizing responsiveness, clean state handling, and modular system design. The player system separates movement, combat logic, hitbox management, and projectile interaction to maintain clarity and scalability.

This project highlights my ability to build tight, deterministic player controls and structured combat systems that remain performant and maintainable under high-intensity gameplay conditions.`,
  gif: "BulletDanceImages/BDGif.gif",
  process: [
    { src: "BulletDanceImages/BDHitbox.png", caption: `Dynamic swing and interaction hitboxes are activated through tightly controlled state windows.
Combat timing is frame-sensitive, supporting projectile interception and precision spacing.
Hit detection is decoupled from animation to ensure consistent gameplay behavior under high projectile density.` },
    { src: "BulletDanceImages/PlayerArchitecture.png", caption: `Full modular player implementation separating movement, combat logic, hitboxes, and interaction layers.
The architecture emphasizes deterministic control, clear state transitions, and low coupling between systems — allowing combat features to evolve without destabilizing core movement logic.` },
    { src: "BulletDanceImages/Bullets.png", caption: `Reusable projectile architecture built for dense bullet scenarios.
Bullet updates, collision resolution, and lifecycle handling are structured for scalability and predictable behavior.
Designed to maintain performance and readability even during high-intensity combat sequences.` }
  ],
  features: [
    {
      title: "Angular Aim Assist System",
      text:  `Developed a deterministic aim correction framework designed to operate under dense projectile pressure without compromising player agency. The system performs directional candidate evaluation, weighted threat scoring, and constrained vector re-projection within a strictly bounded assist cone.
Rather than snapping to targets, the system performs controlled vector blending using configurable angular tolerances and distance-weighted prioritization. All correction is isolated from firing execution to maintain clear separation between input interpretation and combat resolution.`,
      codeSamples: [
        { label: "Angular Filtering & Cone Constraint", filename: "AFCC.cs", url: "BulletDanceCode/AFCC.cs", lang: "cs" },
        { label: "Distance-Weighted Threat Scoring", filename: "DWTS.cs", url: "BulletDanceCode/DWTS.cs", lang: "cs" },
        { label: "Deterministic Vector Reprojection", filename: "DVR.cs", url: "BulletDanceCode/DVR.cs", lang: "cs" }
      ]
    }
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("BulletDanceProject", BulletDanceProject);
