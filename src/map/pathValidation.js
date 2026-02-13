import { TILES } from "./wfc/tiles";

/**
 * Check if there's a walkable path from top to bottom of the map
 * Uses BFS to find any path from top spawn area to bottom spawn area
 * All tiles are walkable now, just with different costs
 */
export function hasPathTopToBottom(map) {
  const height = map.length;
  const width = map[0].length;
  
  // Find tiles in top area (enemy spawn) - check any tile since all are walkable
  const startTiles = [];
  for (let y = 3; y <= 6; y++) {
    for (let x = 10; x <= 20; x++) {
      startTiles.push({ x, y });
    }
  }
  
  if (startTiles.length === 0) return false;
  
  // BFS from any top tile to any bottom tile
  const visited = new Set();
  const queue = [...startTiles];
  
  startTiles.forEach(tile => {
    visited.add(`${tile.x},${tile.y}`);
  });
  
  while (queue.length > 0) {
    const { x, y } = queue.shift();
    
    // Check if we reached bottom spawn area
    if (y >= 14 && y <= 17 && x >= 10 && x <= 20) {
      return true;
    }
    
    // Check all 4 directions
    const directions = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    ];
    
    for (const next of directions) {
      if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) continue;
      
      const key = `${next.x},${next.y}`;
      if (visited.has(key)) continue;
      
      // All tiles are walkable now
      visited.add(key);
      queue.push(next);
    }
  }
  
  return false;
}

/**
 * Get walk cost for a tile
 */
export function getTileWalkCost(tileId) {
  const tile = TILES.find(t => t.id === tileId);
  return tile?.walkCost ?? 1;
}

/**
 * Check if a tile is spawnable
 */
function isTileSpawnable(tileId) {
  const tile = TILES.find(t => t.id === tileId);
  return tile?.spawnable ?? false;
}

/**
 * Generate a map with path validation
 * Regenerates up to maxAttempts times if no path exists
 */
export function generateValidatedMap(generateMapFn, width, height, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const map = generateMapFn(width, height);
    
    if (hasPathTopToBottom(map)) {
      return map;
    }
    
    console.log(`Map attempt ${i + 1} failed path validation, regenerating...`);
  }
  
  // Return last attempt even if invalid (shouldn't happen often with bridges)
  console.warn("Could not generate a valid map with path, using last attempt");
  return generateMapFn(width, height);
}
