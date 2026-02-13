import { MAP_WIDTH, MAP_HEIGHT } from "./battleConfig";
import { TILES } from "./wfc/tiles";

// Define spawn areas (rectangular regions)
// Friendly at bottom, Enemy at top for better mobile view
// Positioned to ensure visibility on all screen sizes
export const SPAWN_AREAS = {
  FRIENDLY: {
    minX: 10,
    maxX: 20,
    minY: 14,
    maxY: 17
  },
  ENEMY: {
    minX: 10,
    maxX: 20,
    minY: 3,
    maxY: 6
  }
};

/**
 * Check if a tile is spawnable
 */
function isTileSpawnable(tileId) {
  const tile = TILES.find(t => t.id === tileId);
  return tile?.spawnable ?? false;
}

/**
 * Get a random position within a spawn area
 */
function getRandomPosition(area) {
  const x = area.minX + Math.floor(Math.random() * (area.maxX - area.minX + 1));
  const y = area.minY + Math.floor(Math.random() * (area.maxY - area.minY + 1));
  return { x, y };
}

/**
 * Check if a position is already occupied by any unit
 */
function isPositionOccupied(x, y, existingUnits) {
  return existingUnits.some(unit => unit.x === x && unit.y === y);
}

/**
 * Get a random unoccupied spawn position within an area
 * @param {Object} area - Spawn area with minX, maxX, minY, maxY
 * @param {Array} existingUnits - Units already placed
 * @param {Array} map - The game map (2D array of tile IDs)
 * @param {number} maxAttempts - Maximum attempts to find a valid position
 * @returns {Object|null} {x, y} position or null if no valid position found
 */
export function getSpawnPosition(area, existingUnits = [], map = null, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    const pos = getRandomPosition(area);
    
    // Check if position is occupied by another unit
    if (isPositionOccupied(pos.x, pos.y, existingUnits)) continue;
    
    // Check if tile is spawnable (if map is provided)
    if (map && !isTileSpawnable(map[pos.y]?.[pos.x])) continue;
    
    return pos;
  }
  
  console.warn("Could not find a valid spawn position after", maxAttempts, "attempts");
  return getRandomPosition(area); // Return any position as fallback
}

/**
 * Spawn multiple units within an area
 * @param {Array} unitConfigs - Array of unit configuration objects (without x, y)
 * @param {Object} area - Spawn area
 * @param {Array} map - The game map (2D array of tile IDs)
 * @returns {Array} Array of units with spawn positions assigned
 */
export function spawnUnitsInArea(unitConfigs, area, map = null) {
  const spawnedUnits = [];
  
  for (const config of unitConfigs) {
    const pos = getSpawnPosition(area, spawnedUnits, map);
    spawnedUnits.push({
      ...config,
      x: pos.x,
      y: pos.y
    });
  }
  
  return spawnedUnits;
}
