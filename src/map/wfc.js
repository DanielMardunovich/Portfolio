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

const WATER_EDGE_TILES = [
  "water",
  "water_corner_bl",
  "water_corner_bc",
  "water_corner_br",
  "water_corner_tl",
  "water_corner_tc",
  "water_corner_tr",
  "river_rl",
  "river_tb"
];


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

//Shannon entropy
function entropy(cell) {
  if (cell.options.length === 0) return Infinity; //Making sure that entropy cannot return NaN

  const weights = cell.options.map(id => TILE_LOOKUP[id].weight);
  const sum = weights.reduce((a, b) => a + b, 0);

  if (sum === 0) return Infinity;

  let entr = 0;
  for (const w of weights) {
    const p = w / sum;
    entr -= p * Math.log(p);
  }

  return entr + Math.random() * 1e-6;
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

function weightedRandom(options) {
  let total = 0;
  for (const id of options) {
    total += TILE_LOOKUP[id].weight;
  }

  let r = Math.random() * total;
  for (const id of options) {
    r -= TILE_LOOKUP[id].weight;
    if (r <= 0) return id;
  }

  return options[0];
}


function collapse(cell) {
  const choice = weightedRandom(cell.options);
  cell.options = [choice];
  cell.collapsed = true;
}

function forceTile(grid, x, y, tileId) {
  const cell = grid[y]?.[x];
  if (!cell) return;

  cell.options = [tileId];
  cell.collapsed = true;

  propagate(grid, x, y);
}



function propagate(grid, startX, startY) {
  const stack = [{ x: startX, y: startY }];

  const dirs = [
    { dx: 0, dy: -1, dir: "up", opp: "down" },
    { dx: 0, dy: 1, dir: "down", opp: "up" },
    { dx: -1, dy: 0, dir: "left", opp: "right" },
    { dx: 1, dy: 0, dir: "right", opp: "left" },
  ];

  while (stack.length) {
    const { x, y } = stack.pop();
    const cell = grid[y][x];

    for (const { dx, dy, dir } of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const neighbor = grid[ny]?.[nx];
      if (!neighbor || neighbor.collapsed) continue;

      const allowed = neighbor.options.filter(option =>
        cell.options.some(tile =>
          EDGES[tile][dir].includes(option)
        )
      );

      if (allowed.length < neighbor.options.length) {
        neighbor.options = allowed;
        stack.push({ x: nx, y: ny });
      }
    }
  }
}

export function generateMap(width, height) {
  const grid = createGrid(width, height);

  //Force tiles here
  /*for(let x = 4; x < 26; x++){
    for(let y = 4; y < 16; y++){
      let rand = Math.floor(Math.random() * 3);;
      switch(rand)
      {
        case 0:
            forceTile(grid, x, y, "grass");
          break;
          case 1: 
            forceTile(grid, x, y, "grass1");
          break;
          case 2:
            forceTile(grid, x, y, "grass2");
            break;
      }
    
    }
  }*/
  
  while (true) {
    const target = findLowestEntropyCell(grid);
    if (!target) break;

    collapse(target.cell);
    propagate(grid, target.x, target.y);
  }

  // return tile IDs (BattleMap expects this)
  return grid.map(row =>
    row.map(cell => cell.options[0])
  );
}

