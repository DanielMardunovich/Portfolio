import { TILES } from "./tiles";


const TILE_BY_ID = Object.fromEntries(
  TILES.map((t) => [t.id, t])
);

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

function weightedRandom(options) {
  const total = options.reduce(
    (sum, id) => sum + TILE_BY_ID[id].weight,
    0
  );

  let r = Math.random() * total;

  for (const id of options) {
    r -= TILE_BY_ID[id].weight;
    if (r <= 0) return id;
  }
}

function compatible(a, b, dir) {
  return (
    TILE_BY_ID[a].edges[dir] ===
    TILE_BY_ID[b].edges[OPPOSITE[dir]]
  );
}

export function generateMap(width, height) {
  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      collapsed: false,
      options: TILES.map((t) => t.id),
    }))
  );

  function collapseLowestEntropy() {
    let best = null;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        if (!cell.collapsed) {
          if (!best || cell.options.length < best.options.length) {
            best = { x, y, options: cell.options };
          }
        }
      }
    }

    return best;
  }

  function propagate(x, y) {
    const stack = [[x, y]];

    while (stack.length) {
      const [cx, cy] = stack.pop();
      const cell = grid[cy][cx];

      for (const dir in DIRECTIONS) {
        const [dx, dy] = DIRECTIONS[dir];
        const nx = cx + dx;
        const ny = cy + dy;

        if (
          nx < 0 || ny < 0 ||
          nx >= width || ny >= height
        ) continue;

        const neighbor = grid[ny][nx];
        if (neighbor.collapsed) continue;

        const valid = neighbor.options.filter((opt) =>
          cell.options.some((c) =>
            compatible(c, opt, dir)
          )
        );

        if (valid.length < neighbor.options.length) {
          neighbor.options = valid;
          stack.push([nx, ny]);
        }
      }
    }
  }

  while (true) {
    const cell = collapseLowestEntropy();
    if (!cell) break;

    const { x, y } = cell;
    const chosen = weightedRandom(grid[y][x].options);

    grid[y][x] = {
      collapsed: true,
      options: [chosen],
    };

    propagate(x, y);
  }

  return grid.map((row) =>
    row.map((cell) => cell.options[0])
  );
}
