export function getMovementTiles(unit, mapWidth, mapHeight, isWalkable) {
  const tiles = [];

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
      if (dist > unit.move) continue;

      if (isWalkable && !isWalkable(x, y)) continue;

      tiles.push({ x, y });
    }
  }

  return tiles;
}

export function canMoveTo(tile, unit, map) {} // later
