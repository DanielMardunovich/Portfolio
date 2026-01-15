import { TILES } from "./tiles";
import { EDGES } from "./edges";

// --------------------------------------------------
// Tile helpers
// --------------------------------------------------
const TILE_LOOKUP = Object.fromEntries(TILES.map(t => [t.id, t]));
const ALL_TILE_IDS = TILES.map(t => t.id);

const IS_RIVER = id => typeof id === "string" && id.startsWith("river");
const IS_WATER = id => typeof id === "string" && id.startsWith("water");

const DIRECTIONS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

// --------------------------------------------------
// Grid + Cell
// --------------------------------------------------
function createCell() {
  return {
    collapsed: false,
    options: [...ALL_TILE_IDS],
  };
}

function createGrid(width, height) {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => createCell())
  );
}

// --------------------------------------------------
// Entropy
// --------------------------------------------------
function entropy(cell) {
  if (!cell.options.length) return Infinity;

  const weights = cell.options.map(id => TILE_LOOKUP[id].weight);
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!sum) return Infinity;

  let e = 0;
  for (const w of weights) {
    const p = w / sum;
    e -= p * Math.log(p);
  }
  return e;
}

function findLowestEntropyCell(grid) {
  let best = null;

  grid.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell.collapsed || !cell.options.length) return;
      if (!best || entropy(cell) < entropy(best.cell)) {
        best = { cell, x, y };
      }
    })
  );

  return best;
}

// --------------------------------------------------
// Weighted random (center bias)
// --------------------------------------------------
function weightedRandom(options, x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const dist = Math.min(
    1,
    Math.hypot(Math.abs(x - cx) / cx, Math.abs(y - cy) / cy)
  );

  let total = 0;
  const weighted = options.map(id => {
    let w = TILE_LOOKUP[id].weight;

    if (dist < 0.35) {
      if (id.startsWith("grass")) w *= 2.8;
      if (IS_RIVER(id)) w *= 0.08;
      if (IS_WATER(id)) w *= 0.04;
    } else if (dist < 0.6) {
      if (id.startsWith("grass")) w *= 1.6;
      if (IS_RIVER(id)) w *= 0.4;
      if (IS_WATER(id)) w *= 0.3;
    }

    total += w;
    return { id, w };
  });

  let r = Math.random() * total;
  for (const o of weighted) {
    if ((r -= o.w) <= 0) return o.id;
  }

  return weighted[0].id;
}

// --------------------------------------------------
// River gate (during WFC)
// --------------------------------------------------
function hasWaterNeighbor(grid, x, y) {
  for (const [dx, dy] of Object.values(DIRECTIONS)) {
    const n = grid[y + dy]?.[x + dx];
    if (!n) continue;

    if (n.collapsed) {
      const id = n.options[0];
      if (IS_WATER(id) || IS_RIVER(id)) return true;
    } else {
      if (n.options.some(o => IS_WATER(o) || IS_RIVER(o))) return true;
    }
  }
  return false;
}

// --------------------------------------------------
// Collapse + Propagation
// --------------------------------------------------
function collapse(cell, x, y, width, height, grid) {
  let options = cell.options.filter(id =>
    !IS_RIVER(id) || hasWaterNeighbor(grid, x, y)
  );

  if (!options.length) {
    options = cell.options.filter(id => !IS_RIVER(id));
  }

  cell.options = [weightedRandom(options, x, y, width, height)];
  cell.collapsed = true;
}

function propagate(grid, sx, sy) {
  const stack = [{ x: sx, y: sy }];

  while (stack.length) {
    const { x, y } = stack.pop();
    const cell = grid[y][x];

    for (const dir in DIRECTIONS) {
      const [dx, dy] = DIRECTIONS[dir];
      const nx = x + dx;
      const ny = y + dy;
      const n = grid[ny]?.[nx];
      if (!n || n.collapsed) continue;

      const allowed = n.options.filter(opt =>
        cell.options.some(tile => EDGES[tile][dir].includes(opt))
      );

      if (allowed.length < n.options.length) {
        n.options = allowed;
        stack.push({ x: nx, y: ny });
      }
    }
  }
}

// --------------------------------------------------
// Post-pass 1: apply correct river endings
// --------------------------------------------------
function pruneInvalidRivers(grid) {
  const h = grid.length;
  const w = grid[0].length;

  const riverAt = (x, y) => IS_RIVER(grid[y]?.[x]);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const id = grid[y][x];

      if (id === "river_connectsgrass_tb") {
        const up = riverAt(x, y - 1);
        const down = riverAt(x, y + 1);
        if ((up && !down) || (!up && down)) {
          grid[y][x] = up
            ? "river_connectsgrass_tbr"
            : "river_connectsgrass_tbl";
        }
      }

      if (id === "river_connectsgrass_lr") {
        const left = riverAt(x - 1, y);
        const right = riverAt(x + 1, y);
        if ((left && !right) || (!left && right)) {
          grid[y][x] = left
            ? "river_connectsgrass_trl"
            : "river_connectsgrass_brl";
        }
      }
    }
  }
}

// --------------------------------------------------
// Post-pass 2: remove river-only loops
// --------------------------------------------------
function breakRiverLoops(grid) {
  const h = grid.length;
  const w = grid[0].length;
  const visited = Array.from({ length: h }, () => Array(w).fill(false));

  const neighbors = (x, y) =>
    Object.values(DIRECTIONS)
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => grid[ny]?.[nx]);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!IS_RIVER(grid[y][x]) || visited[y][x]) continue;

      const stack = [[x, y]];
      const component = [];
      let touchesWater = false;

      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (visited[cy][cx]) continue;
        visited[cy][cx] = true;
        component.push([cx, cy]);

        for (const [nx, ny] of neighbors(cx, cy)) {
          const id = grid[ny][nx];
          if (IS_WATER(id)) touchesWater = true;
          if (IS_RIVER(id) && !visited[ny][nx]) stack.push([nx, ny]);
        }
      }

      if (!touchesWater) {
        for (const [rx, ry] of component) {
          grid[ry][rx] = "grass_empty";
        }
      }
    }
  }
}

// --------------------------------------------------
// Map Generator
// --------------------------------------------------
export function generateMap(width, height) {
  const grid = createGrid(width, height);

  while (true) {
    const target = findLowestEntropyCell(grid);
    if (!target) break;

    collapse(target.cell, target.x, target.y, width, height, grid);
    propagate(grid, target.x, target.y);
  }

  const result = grid.map(row =>
    row.map(cell => cell.options[0] ?? "grass_empty")
  );

  pruneInvalidRivers(result);
  breakRiverLoops(result);

  return result;
}
