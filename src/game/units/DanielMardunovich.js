import UnitBase from "./UnitBase.js";
import { registerUnitType, FACTION } from "../units.js";

// Example unit showing defaults for a derived type.
export default class DanielMardunovich extends UnitBase {
  constructor(opts = {}) {
    super({
      ...opts,
      faction: opts.faction || FACTION.ENEMY,
      sprite: opts.sprite || "Me/PixelMe16.png",
      hp: opts.hp ?? 12,
      atk: opts.atk ?? 5,
      move: opts.move ?? 6,
      range: opts.range ?? 1,
      images: opts.images || [
        "Me/BarThingy.png",
        "Me/Golf.png",
        "Me/Dog.jpg",
        "Me/Skii.png",
        "Me/Boat.png",
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
        description: `
Hi! I’m a game developer who loves bringing ideas to life through code. I work in both Unreal Engine and Unity, mainly using C++ and C#, with some experience in Java as well. I enjoy building gameplay systems that feel responsive, satisfying, and fun to interact with.

I have a Bachelor’s degree in Game Design from Uppsala University, where I combined design thinking with technical problem-solving. When I’m not developing games, I’m usually playing them, hitting the court for paddleball or tennis, or skiing during the winter.

I’m always excited to learn, improve, and collaborate on creative projects.
`,
  gif: "Me/wide_daniel.gif",
  process: [
    { src: "Me/Suit.jpg", caption: `Game Developer | Unreal & Unity | C++ / C#` },
    { src: "Me/Sissi1.jpg", caption: `My lovely dog Sinestra of Fortis (Or Sissi for short)` },
    { src: "Me/PriceWinner.jpg", caption: `On stage after winning students choice award for the game project BulletDance` }
  ],
  features: [
    {
      title: "Contact Info",
      text: "You can reach me via email at mardunovich@gmail.com or connect with me on LinkedIn.",
      codeSamples: []
    },
  ]
}
    });
  }
}

// register this example so it can be created by type name
registerUnitType("DanielMardunovich", DanielMardunovich);
