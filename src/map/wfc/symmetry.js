const OPPOSITE = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function enforceSymmetry(edges) {
  for (const tile in edges) {
    for (const dir in edges[tile]) {
      const opposite = OPPOSITE[dir];

      edges[tile][dir].forEach(neighbor => {
        if (!edges[neighbor]) {
          console.warn(`Missing tile: ${neighbor}`);
          return;
        }

        edges[neighbor][opposite] ??= [];

        if (!edges[neighbor][opposite].includes(tile)) {
          edges[neighbor][opposite].push(tile);
        }
      });
    }
  }
}
