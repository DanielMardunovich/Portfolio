import { TILES } from "./tiles";
import { EDGES } from "./edges";

/* ======================================================
   TILE LOOKUP
====================================================== */

const TILE = Object.fromEntries(TILES.map(t => [t.id, t]));
const ALL_IDS = TILES.map(t => t.id);

/* ======================================================
   TILE SEMANTICS
====================================================== */

const GRASS = new Set(["grass", "grass1", "grass2"]);

const isGrass = id => GRASS.has(id);
const isLake = id => id === "water";
const isLakeEdge = id => id.startsWith("water_");
const isRiver = id => id.startsWith("river");

const isRiverEntrance = (id) => id.startsWith("river_entrance");

function entranceWaterDirection(id) {
  if (id.endsWith("_u")) return [0, 1];   // water BELOW
  if (id.endsWith("_d")) return [0, -1];  // water ABOVE
  if (id.endsWith("_l")) return [1, 0];   // water RIGHT
  if (id.endsWith("_r")) return [-1, 0];  // water LEFT
  return null;
}

function entranceTouchesLake(grid, x, y, id) {
  const dir = entranceWaterDirection(id);
  if (!dir) return false;

  const [dx, dy] = dir;
  const n = grid[y + dy]?.[x + dx];
  if (!n) return false;

  // ✔ If neighbor is already water → valid
  if (n.collapsed && n.options[0] === "water") return true;

  // ✔ If neighbor could become water → valid
  return n.options.includes("water");
}


/* ======================================================
   LIMITS
====================================================== */

const MAX_LAKES = 1;
const MAX_LAKE_TILES = 12;
const MAX_RIVERS = 20;

let lakeCount = 0;
let lakeTiles = 0;
let riverCount = 0;

/* ======================================================
   GRID
====================================================== */

function makeCell() {
  return { collapsed: false, options: [...ALL_IDS] };
}

function makeGrid(w, h) {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, makeCell)
  );
}

/* ======================================================
   UTILS
====================================================== */

const DIRS = [
  [0,-1], [0,1], [-1,0], [1,0]
];

function centerFactor(x, y, w, h) {
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  return Math.min(1, Math.hypot(x - cx, y - cy) / Math.hypot(cx, cy));
}

function wetness(y, h) {
  return 1 - y / (h - 1); // top wet, bottom dry
}

function touches(grid, x, y, predicate) {
  return DIRS.some(([dx,dy]) => {
    const n = grid[y+dy]?.[x+dx];
    return n?.collapsed && predicate(n.options[0]);
  });
}

function newLake(grid, x, y) {
  return !touches(grid, x, y, id => id === "water");
}

function newRiver(grid, x, y) {
  return !touches(grid, x, y, isRiver);
}

/* ======================================================
   WEIGHTED PICK
====================================================== */

function pick(options, weightFn) {
  let sum = 0;
  for (const id of options) sum += weightFn(id);

  let r = Math.random() * sum;
  for (const id of options) {
    r -= weightFn(id);
    if (r <= 0) return id;
  }
  return options[0];
}

/* ======================================================
   COLLAPSE
====================================================== */

function collapse(cell, x, y, grid, w, h) {
  const c = centerFactor(x, y, w, h);
  const wet = wetness(y, h);

  const choice = pick(cell.options, id => {
    const base = TILE[id].weight;

    // -------- GRASS (arena-safe)
    if (isGrass(id)) {
      return base * (1.4 - c);
    }

    // -------- LAKE INTERIOR
    if (isLake(id)) {
      if (lakeTiles >= MAX_LAKE_TILES) return 0.001;
      if (lakeCount >= MAX_LAKES && newLake(grid, x, y)) return 0.001;
      return base * (0.6 + wet) * (1 - c);
    }

    // -------- RIVER LOGIC (ALL river handling is here)
    if (isRiver(id)) {

      // ---- RIVER ENTRANCE ----
      if (isRiverEntrance(id)) {

        // MUST have water in the correct direction
        if (!entranceTouchesLake(grid, x, y, id)) {
          return 0.001;
        }

        // Limit number of river systems
        if (riverCount >= MAX_RIVERS && newRiver(grid, x, y)) {
          return 0.001;
        }

        // Bootstrap first river so it can start
        const bootstrap = riverCount === 0 ? 3.0 : 1.0;

        return base
          * bootstrap
          * (1.2 + wet)
          * (1 - c);
      }

      // ---- RIVER CONTINUATION ----
      // Non-entrance river tiles may NOT start rivers
      if (newRiver(grid, x, y)) {
        return 0.001;
      }

      return base
        * (1.8 + wet)
        * (1 - c);
    }

    // -------- LAKE SHAPING
    if (isLakeEdge(id)) {
      return base * (1 + wet);
    }

    return base;
  });

  // ----- COUNT LAKES
  if (choice === "water") {
    if (newLake(grid, x, y)) lakeCount++;
    lakeTiles++;
  }

  // ----- COUNT RIVERS (ONLY entrances start rivers)
  if (isRiverEntrance(choice) && newRiver(grid, x, y)) {
    riverCount++;
  }

  cell.options = [choice];
  cell.collapsed = true;
}


/* ======================================================
   PROPAGATION
====================================================== */

function propagate(grid, sx, sy) {
  const stack = [[sx, sy]];

  const DIRMAP = [
    { dx:0, dy:-1, dir:"up" },
    { dx:0, dy:1,  dir:"down" },
    { dx:-1,dy:0,  dir:"left" },
    { dx:1, dy:0,  dir:"right" }
  ];

  while (stack.length) {
    const [x,y] = stack.pop();
    const cell = grid[y][x];

    for (const {dx,dy,dir} of DIRMAP) {
      const nx = x+dx, ny = y+dy;
      const n = grid[ny]?.[nx];
      if (!n || n.collapsed) continue;

      const allowed = n.options.filter(o =>
        cell.options.some(t => EDGES[t][dir].includes(o))
      );

      if (allowed.length < n.options.length) {
        n.options = allowed;
        stack.push([nx,ny]);
      }
    }
  }
}

/* ======================================================
   ENTROPY
====================================================== */

function entropy(cell) {
  const w = cell.options.map(id => TILE[id].weight);
  const s = w.reduce((a,b)=>a+b,0);
  return -w.reduce((e,v)=>e+(v/s)*Math.log(v/s),0);
}

function lowestEntropy(grid) {
  let best = null;
  grid.forEach((row,y)=>row.forEach((c,x)=>{
    if (!c.collapsed && (!best || entropy(c) < entropy(best.cell))) {
      best = { cell:c, x, y };
    }
  }));
  return best;
}

/* ======================================================
   GENERATE
====================================================== */

export function generateMap(width, height) {
  lakeCount = lakeTiles = riverCount = 0;
  const grid = makeGrid(width, height);

  while (true) {
    const t = lowestEntropy(grid);
    if (!t) break;
    collapse(t.cell, t.x, t.y, grid, width, height);
    propagate(grid, t.x, t.y);
  }

  return grid.map(r => r.map(c => c.options[0]));
}
