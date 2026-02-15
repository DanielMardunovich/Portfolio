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
 * Find the nearest spawnable tile around a given position
 * Searches in expanding rings around the original position
 * @param {number} x - Original x position
 * @param {number} y - Original y position
 * @param {Array} map - The game map (2D array of tile IDs)
 * @param {Array} existingUnits - Units already placed
 * @param {number} maxRadius - Maximum search radius
 * @returns {Object|null} {x, y} position or null if no valid position found
 */
function findNearbySpawnableTile(x, y, map, existingUnits = [], maxRadius = 10) {
  if (!map) return null;
  
  const mapHeight = map.length;
  const mapWidth = map[0]?.length || 0;
  
  // Search in expanding rings
  for (let radius = 1; radius <= maxRadius; radius++) {
    // Check all positions at this distance
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check positions at exactly this radius (ring, not filled circle)
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        // Check bounds
        if (nx < 0 || ny < 0 || nx >= mapWidth || ny >= mapHeight) continue;
        
        // Check if spawnable and not occupied
        if (isTileSpawnable(map[ny][nx]) && !isPositionOccupied(nx, ny, existingUnits)) {
          return { x: nx, y: ny };
        }
      }
    }
  }
  
  return null;
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
    if (map) {
      if (isTileSpawnable(map[pos.y]?.[pos.x])) {
        return pos; // Found a good spot
      }
      
      // If the chosen position is on water, look for nearby spawnable tile
      const nearbyPos = findNearbySpawnableTile(pos.x, pos.y, map, existingUnits);
      if (nearbyPos) {
        return nearbyPos;
      }
    } else {
      return pos;
    }
  }
  
  console.warn("Could not find a valid spawn position after", maxAttempts, "attempts");
  
  // Last resort: try to find ANY spawnable tile near the center of the spawn area
  if (map) {
    const centerX = Math.floor((area.minX + area.maxX) / 2);
    const centerY = Math.floor((area.minY + area.maxY) / 2);
    const fallbackPos = findNearbySpawnableTile(centerX, centerY, map, existingUnits, 20);
    if (fallbackPos) return fallbackPos;
  }
  
  return getRandomPosition(area); // Return any position as final fallback
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
