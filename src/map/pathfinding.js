import { getTileWalkCost } from "./pathValidation";

/**
 * A* pathfinding implementation for tactical movement
 */
export function findPath(startX, startY, endX, endY, map, maxCost, occupiedPositions = []) {
  const width = map[0].length;
  const height = map.length;

  // Check if end position is valid
  if (endX < 0 || endX >= width || endY < 0 || endY >= height) {
    return null;
  }

  const key = (x, y) => `${x},${y}`;
  const occupiedSet = new Set((occupiedPositions || []).map(p => key(p.x, p.y)));
  
  // Node structure: { x, y, g (cost from start), h (heuristic), f (total), parent }
  const openSet = new Set();
  const closedSet = new Set();
  const nodes = new Map();
  
  const startNode = {
    x: startX,
    y: startY,
    g: 0,
    h: Math.abs(endX - startX) + Math.abs(endY - startY),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  
  nodes.set(key(startX, startY), startNode);
  openSet.add(key(startX, startY));
  
  while (openSet.size > 0) {
    // Find node with lowest f score
    let currentKey = null;
    let lowestF = Infinity;
    
    for (const k of openSet) {
      const node = nodes.get(k);
      if (node.f < lowestF) {
        lowestF = node.f;
        currentKey = k;
      }
    }
    
    const current = nodes.get(currentKey);
    
    // Reached destination
    if (current.x === endX && current.y === endY) {
      return reconstructPath(current);
    }
    
    openSet.delete(currentKey);
    closedSet.add(currentKey);
    
    // Check neighbors (4 directions)
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    
    for (const neighbor of neighbors) {
      const { x, y } = neighbor;
      
      // Check bounds
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const neighborKey = key(x, y);
      // If neighbor is occupied (and not the starting tile), skip it
      if (occupiedSet.has(neighborKey) && !(x === startX && y === startY)) continue;
      if (closedSet.has(neighborKey)) continue;
      
      const tileCost = getTileWalkCost(map[y][x]);
      const tentativeG = current.g + tileCost;
      
      // Check if this path exceeds max movement cost
      if (maxCost !== undefined && tentativeG > maxCost) continue;
      
      let neighborNode = nodes.get(neighborKey);
      
      if (!neighborNode) {
        neighborNode = {
          x,
          y,
          g: Infinity,
          h: Math.abs(endX - x) + Math.abs(endY - y),
          f: Infinity,
          parent: null
        };
        nodes.set(neighborKey, neighborNode);
      }
      
      if (tentativeG < neighborNode.g) {
        neighborNode.g = tentativeG;
        neighborNode.f = neighborNode.g + neighborNode.h;
        neighborNode.parent = current;
        
        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        }
      }
    }
  }
  
  return null; // No path found
}

function reconstructPath(endNode) {
  const path = [];
  let current = endNode;
  
  while (current !== null) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  
  return path;
}

/**
 * Get all tiles reachable within movement range using cost-based pathfinding
 */
export function getReachableTiles(startX, startY, maxCost, map, occupiedPositions = []) {
  const width = map[0].length;
  const height = map.length;
  const reachable = [];
  const addedToReachable = new Set(); // <-- add this
  
  const key = (x, y) => `${x},${y}`;
  const visited = new Map();
  const queue = [{ x: startX, y: startY, cost: 0 }];
  visited.set(key(startX, startY), 0);
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (!(current.x === startX && current.y === startY)) {
      const isOccupied = occupiedPositions.some(pos => pos.x === current.x && pos.y === current.y);
      const tileKey = key(current.x, current.y);
      // Only add to reachable once per tile
      if (!isOccupied && !addedToReachable.has(tileKey)) {
        addedToReachable.add(tileKey);
        reachable.push({ x: current.x, y: current.y, cost: current.cost });
      }
    }
    
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    
    for (const neighbor of neighbors) {
      const { x, y } = neighbor;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const tileCost = getTileWalkCost(map[y][x]);
      const newCost = current.cost + tileCost;
      
      if (newCost > maxCost) continue;
      
      const neighborKey = key(x, y);
      const previousCost = visited.get(neighborKey);
      
      if (previousCost === undefined || newCost < previousCost) {
        visited.set(neighborKey, newCost);
        queue.push({ x, y, cost: newCost });
      }
    }
  }
  
  return reachable;
}

/**
 * Get arrow tile direction for path visualization
 */
export function getArrowTileForPath(path, index) {
  if (index === 0 || index >= path.length) return null;
  
  const prev = index > 0 ? path[index - 1] : null;
  const curr = path[index];
  const next = index < path.length - 1 ? path[index + 1] : null;
  
  // Determine direction we came FROM (entrance direction)
  const fromDir = prev ? getDirection(prev, curr) : null;
  // Determine direction we're going TO (exit direction)
  const toDir = next ? getDirection(curr, next) : null;
  
  if (!next) {
    // End of path - arrow points in direction of movement (where we're going)
    if (fromDir === "right") return "arrow_right";
    if (fromDir === "left") return "arrow_left";
    if (fromDir === "down") return "arrow_down";
    if (fromDir === "up") return "arrow_up";
  }
  
  if (fromDir === toDir) {
    // Straight line - ud connects up/down, lr connects left/right
    if (fromDir === "right" || fromDir === "left") return "arrow_helper_lr";
    if (fromDir === "down" || fromDir === "up") return "arrow_helper_ud";
  }
  
  // Corners
  // The tile name describes which two sides are OPEN (where path enters and exits).
  // fromDir = direction we travelled TO reach this tile (i.e. the entry side is the opposite)
  // toDir   = direction we will travel LEAVING this tile (i.e. the exit side)
  //
  // Entry side  = opposite of fromDir
  // Exit side   = toDir
  //
  // right then up  : enters from left, exits top    → open left+top    = ul  (└)
  if (fromDir === "right" && toDir === "up") return "arrow_helper_ul";
  // right then down: enters from left, exits bottom → open left+bottom = ld  (┌)
  if (fromDir === "right" && toDir === "down") return "arrow_helper_ld";

  // left then up   : enters from right, exits top   → open right+top   = ur  (┘)
  if (fromDir === "left" && toDir === "up") return "arrow_helper_ur";
  // left then down : enters from right, exits bottom→ open right+bottom= dr  (┐)
  if (fromDir === "left" && toDir === "down") return "arrow_helper_dr";

  // down then right: enters from top, exits right   → open top+right   = dr  (┐) wait —
  // enters top, exits right → open top+right = ur? No:
  // "ur" = up+right open = ┘ shape — that connects top and right, correct for entering-from-top exiting-right
  if (fromDir === "down" && toDir === "right") return "arrow_helper_ur";
  // down then left : enters from top, exits left    → open top+left    = ul  (└)
  if (fromDir === "down" && toDir === "left") return "arrow_helper_ul";

  // up then right  : enters from bottom, exits right→ open bottom+right= dr  (┐)
  if (fromDir === "up" && toDir === "right") return "arrow_helper_dr";
  // up then left   : enters from bottom, exits left → open bottom+left = ld  (┌)
  if (fromDir === "up" && toDir === "left") return "arrow_helper_ld";
  
  return "arrow_helper_ud";
}

function getDirection(from, to) {
  if (to.x > from.x) return "right";
  if (to.x < from.x) return "left";
  if (to.y > from.y) return "down";
  if (to.y < from.y) return "up";
  return null;
}