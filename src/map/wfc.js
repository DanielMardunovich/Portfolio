import { TILES } from "./tiles";
import { EDGES } from "./edges";

const TILE_LOOKUP = Object.fromEntries(
  TILES.map(t => [t.id, t])
);

const ALL_TILE_IDS = TILES.map(t => t.id);

const DIRECTIONS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const OPPOSITE = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

// -------------------------
// Grid + Cell
// -------------------------
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

// -------------------------
// Entropy (NO jitter)
// -------------------------
function entropy(cell) {
  if (cell.options.length === 0) return Infinity;

  const weights = cell.options.map(id => TILE_LOOKUP[id].weight);
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return Infinity;

  let e = 0;
  for (const w of weights) {
    const p = w / sum;
    e -= p * Math.log(p);
  }
  return e;
}

function findLowestEntropyCell(grid) {
  let best = null;

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.collapsed || cell.options.length === 0) return;
      if (!best || entropy(cell) < entropy(best.cell)) {
        best = { cell, x, y };
      }
    });
  });

  return best;
}

// -------------------------
// Distance-biased random
// -------------------------
function weightedRandom(options, x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;

  const dx = Math.abs(x - cx) / cx;
  const dy = Math.abs(y - cy) / cy;

  // Radial distance (0 = center, 1 = corners)
  const dist = Math.min(1, Math.hypot(dx, dy));

  let total = 0;
  const adjusted = options.map(id => {
    let w = TILE_LOOKUP[id].weight;

    // CENTER: extremely open
    if (dist < 0.35) {
      if (id.startsWith("grass")) w *= 2.8;
      if (id.startsWith("river")) w *= 0.08;
      if (id.startsWith("water")) w *= 0.04;
    }
    // MID RING: mostly open
    else if (dist < 0.6) {
      if (id.startsWith("grass")) w *= 1.6;
      if (id.startsWith("river")) w *= 0.4;
      if (id.startsWith("water")) w *= 0.3;
    }
    // OUTER EDGE: neutral
    else {
      if (id.startsWith("grass")) w *= 1.0;
      if (id.startsWith("river")) w *= 1.0;
      if (id.startsWith("water")) w *= 1.0;
    }

    total += w;
    return { id, w };
  });

  let r = Math.random() * total;
  for (const o of adjusted) {
    r -= o.w;
    if (r <= 0) return o.id;
  }

  return adjusted[0].id;
}


function collapse(cell, x, y, width, height) {
  const choice = weightedRandom(cell.options, x, y, width, height);
  cell.options = [choice];
  cell.collapsed = true;
}

// -------------------------
// Propagation
// -------------------------
function propagate(grid, startX, startY) {
  const stack = [{ x: startX, y: startY }];

  while (stack.length) {
    const { x, y } = stack.pop();
    const cell = grid[y][x];

    for (const dir in DIRECTIONS) {
      const [dx, dy] = DIRECTIONS[dir];
      const nx = x + dx;
      const ny = y + dy;
      const neighbor = grid[ny]?.[nx];
      if (!neighbor || neighbor.collapsed) continue;

      const allowed = neighbor.options.filter(opt =>
        cell.options.some(tile =>
          EDGES[tile][dir].includes(opt)
        )
      );

      if (allowed.length < neighbor.options.length) {
        neighbor.options = allowed;
        stack.push({ x: nx, y: ny });
      }
    }
  }
}

function forceTile(grid, x, y, tileId) {
  const cell = grid[y]?.[x];
  if (!cell) return;

  cell.options = [tileId];
  cell.collapsed = true;
  propagate(grid, x, y);
}

// -------------------------
// Map Generator (FE style)
// -------------------------
export function generateMap(width, height) {
  const grid = createGrid(width, height);

  // -------- WFC SOLVE --------
  while (true) {
    const target = findLowestEntropyCell(grid);
    if (!target) break;

    collapse(target.cell, target.x, target.y, width, height);
    propagate(grid, target.x, target.y);
  }

  // -------- OUTPUT --------
  return grid.map(row =>
    row.map(cell => cell.options[0] ?? "grass_empty")
  );
}
