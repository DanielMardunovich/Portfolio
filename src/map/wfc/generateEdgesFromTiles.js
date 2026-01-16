import fs from "fs";
import { TILES } from "./tiles.js";

const EDGES = {};

for (const tile of TILES) {
  EDGES[tile.id] = {
    up: [],
    down: [],
    left: [],
    right: []
  };
}

const output =
`export const EDGES = ${JSON.stringify(EDGES, null, 2)};\n`;

fs.writeFileSync("./edges.js", output);

console.log("✅ edges.js generated successfully");
