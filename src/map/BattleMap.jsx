import { useEffect, useRef, useState } from "react";
import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import { createUnit, FACTION, UNIT_SPRITES } from "../game/units";
import { generateMap } from "./wfc/wfc";
import { generateValidatedMap } from "./pathValidation";
import UnitMenu from "../ui/UnitMenu";
import InfoPanel from "../ui/InfoPanel";

import { MAP_WIDTH, MAP_HEIGHT, getViewSize, getCenteredCamera } from "./battleConfig";
import { getMovementTiles } from "./battleMovement";
import { attachBattleInput } from "./battleInput";
import { SPAWN_AREAS, spawnUnitsInArea } from "./battleSpawn";
import { findPath, getReachableTiles, getArrowTileForPath } from "./pathfinding";
import {
  drawMap,
  drawUnits,
  drawCursor,
  drawSelection,
  drawMovementRange,
  drawGrid,
  drawPath
} from "./battleRender";

import "../styles/battleMap.css";

export default function BattleMap() {
  const {
    phase,
    setPhase,
    turn,
    setTurn,
    friendlyUnits,
    setFriendlyUnits,
    enemyUnits,
    setEnemyUnits
  } = useGame();

  const canvasRef = useRef(null);
  const tilesetRef = useRef(new Image());
  const unitSpriteRef = useRef(new Image());
  const mapRef = useRef(null);

  const cameraRef = useRef({ x: 0, y: 0 });
  const viewRef = useRef(getViewSize());

  const cursorRef = useRef({ x: 0, y: 0 });
  const selectedUnitRef = useRef(null);
  const imagesLoadedRef = useRef(false);
  const mapRevealStartRef = useRef(0);
  const mapRevealTimeRef = useRef(0);
  const mapRevealRafRef = useRef(null);
  const mapRevealTotalRef = useRef(0);

  const [menuUnit, setMenuUnit] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [moveMode, setMoveMode] = useState(false);
  const [movingUnit, setMovingUnit] = useState(null);
  const [reachableTiles, setReachableTiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [infoPanelUnit, setInfoPanelUnit] = useState(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const enemyTurnHandledRef = useRef(false);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    viewRef.current = getViewSize();
    canvas.width = viewRef.current.tilesX * 16;
    canvas.height = viewRef.current.tilesY * 16;
  };

  const updateScale = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const scaleX = window.innerWidth / canvas.width;
  const scaleY = window.innerHeight / canvas.height;

  // Use the larger scale so it fills the screen
  const scale = Math.max(scaleX, scaleY);

  canvas.style.position = "fixed";
  canvas.style.left = "50%";
  canvas.style.top = "50%";
  canvas.style.transformOrigin = "center";
  canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
};

  const redraw = () => {
    if (!imagesLoadedRef.current || !mapRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const revealTime = phase === PHASES.MAP_INTRO ? mapRevealTimeRef.current : null;
    drawMap(
      ctx,
      mapRef.current,
      tilesetRef.current,
      cameraRef.current,
      viewRef.current,
      MAP_WIDTH,
      MAP_HEIGHT,
      revealTime,
      { staggerMs: 14, dropDurationMs: 260, startYOffset: -32 }
    );
    drawUnits(ctx, friendlyUnits, unitSpriteRef.current, cameraRef.current, viewRef.current);
    drawUnits(ctx, enemyUnits, unitSpriteRef.current, cameraRef.current, viewRef.current);

    // Only show movement range and selection in move mode
    if (moveMode && movingUnit) {
      drawMovementRange(ctx, tilesetRef.current, reachableTiles, cameraRef.current);
      drawSelection(ctx, tilesetRef.current, movingUnit, cameraRef.current);
      
      // Draw path with arrows
      if (currentPath && currentPath.length > 1) {
        drawPath(ctx, tilesetRef.current, currentPath, cameraRef.current, getArrowTileForPath);
      }
    }

    drawCursor(ctx, tilesetRef.current, cursorRef.current, cameraRef.current);
    drawGrid(ctx, viewRef.current.tilesX, viewRef.current.tilesY);
  };

  useEffect(() => {
    if (phase !== PHASES.MAP_INTRO) return;

    resizeCanvas();
    cameraRef.current = getCenteredCamera();
    tilesetRef.current.src = "/Portfolio/TileMap/tilemap.png";
    unitSpriteRef.current.src = "/Portfolio/Units/units.png";

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;
      imagesLoadedRef.current = true;
      mapRef.current = generateValidatedMap(generateMap, MAP_WIDTH, MAP_HEIGHT);

      mapRevealStartRef.current = performance.now();
      mapRevealTimeRef.current = 0;
      const view = viewRef.current;
      const staggerMs = 14;
      const dropDurationMs = 260;
      const maxRing = Math.floor((view.tilesY - 1) / 2);
      const maxMx = cameraRef.current.x + view.tilesX - 1;
      const maxDelay = (maxRing * MAP_WIDTH + maxMx) * staggerMs;
      mapRevealTotalRef.current = maxDelay + dropDurationMs;

      const animateReveal = (now) => {
        mapRevealTimeRef.current = now - mapRevealStartRef.current;
        redraw();

        if (mapRevealTimeRef.current >= mapRevealTotalRef.current) {
          mapRevealTimeRef.current = mapRevealTotalRef.current;
          redraw();
          setPhase(PHASES.MAP_IDLE);
          mapRevealRafRef.current = null;
          return;
        }

        mapRevealRafRef.current = requestAnimationFrame(animateReveal);
      };

      if (mapRevealRafRef.current) {
        cancelAnimationFrame(mapRevealRafRef.current);
      }
      mapRevealRafRef.current = requestAnimationFrame(animateReveal);
    };

    tilesetRef.current.onload = onLoad;
    unitSpriteRef.current.onload = onLoad;

    return () => {
      if (mapRevealRafRef.current) {
        cancelAnimationFrame(mapRevealRafRef.current);
        mapRevealRafRef.current = null;
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASES.MAP_IDLE) return;

    setTurn(TURN.PLAYER);
    
    // Spawn friendly units in their area
    const friendlyConfigs = [
      createUnit({ id: "p1", faction: FACTION.FRIENDLY, sprite: UNIT_SPRITES.FRIENDLY_SOLDIER, x: 0, y: 0 }),
      createUnit({ id: "p2", faction: FACTION.FRIENDLY, sprite: UNIT_SPRITES.FRIENDLY_ARCHER, x: 0, y: 0 })
    ];
    const spawnedFriendly = spawnUnitsInArea(friendlyConfigs, SPAWN_AREAS.FRIENDLY, mapRef.current);
    setFriendlyUnits(spawnedFriendly);
    
    // Spawn enemy units in their area
    const enemyConfigs = [
      createUnit({ id: "e1", faction: FACTION.ENEMY, sprite: UNIT_SPRITES.ENEMY_SOLDIER, x: 0, y: 0 }),
      createUnit({ id: "e2", faction: FACTION.ENEMY, sprite: UNIT_SPRITES.ENEMY_ARCHER, x: 0, y: 0 })
    ];
    const spawnedEnemy = spawnUnitsInArea(enemyConfigs, SPAWN_AREAS.ENEMY, mapRef.current);
    setEnemyUnits(spawnedEnemy);
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return attachBattleInput({
      canvas,
      cameraRef,
      cursorRef,
      selectedUnitRef,
      friendlyUnits,
      enemyUnits,
      redraw,
      onUnitClick: handleUnitClick,
      onTileHover: handleTileHover,
      onTileClick: handleTileClick,
      moveMode
    });
  }, [friendlyUnits, enemyUnits, moveMode, movingUnit, reachableTiles]);

  useEffect(() => {
    redraw();
  }, [friendlyUnits, enemyUnits, moveMode, currentPath]);

  useEffect(() => {
    if (phase !== PHASES.MAP_IDLE) return;
    if (turn !== TURN.PLAYER) return;
    if (moveMode || movingUnit) return;
    if (!mapRef.current || friendlyUnits.length === 0) return;

    const allFriendlyCannotMove = friendlyUnits.every(unit => {
      if (unit.hasActed) return true;

      const occupied = [...friendlyUnits, ...enemyUnits]
        .filter(u => u.id !== unit.id)
        .map(u => ({ x: u.x, y: u.y }));

      const tiles = getReachableTiles(unit.x, unit.y, unit.move, mapRef.current, occupied);
      return tiles.length === 0;
    });

    if (allFriendlyCannotMove) {
      setTurn(TURN.ENEMY);
      setMenuUnit(null);
      setMenuPosition(null);
      setMoveMode(false);
      setMovingUnit(null);
      setReachableTiles([]);
      setCurrentPath(null);
      selectedUnitRef.current = null;
    }
  }, [phase, turn, friendlyUnits, enemyUnits, moveMode, movingUnit]);

  useEffect(() => {
    if (phase !== PHASES.MAP_IDLE) return;
    if (turn !== TURN.ENEMY) {
      enemyTurnHandledRef.current = false;
      return;
    }
    if (enemyTurnHandledRef.current) return;
    enemyTurnHandledRef.current = true;

    if (!mapRef.current || friendlyUnits.length === 0 || enemyUnits.length === 0) {
      setTurn(TURN.PLAYER);
      setFriendlyUnits(units => units.map(u => ({ ...u, hasActed: false })));
      setEnemyUnits(units => units.map(u => ({ ...u, hasActed: false })));
      return;
    }

    const occupiedPositions = [...friendlyUnits, ...enemyUnits].map(u => ({ x: u.x, y: u.y }));
    const updatedEnemies = enemyUnits.map(enemy => {
      if (enemy.hasActed) return enemy;

      const occupied = occupiedPositions.filter(pos => !(pos.x === enemy.x && pos.y === enemy.y));

      const reachable = getReachableTiles(enemy.x, enemy.y, enemy.move, mapRef.current, occupied);
      if (reachable.length === 0) {
        return { ...enemy, hasActed: true };
      }

      let bestTile = null;
      let bestDistance = Infinity;
      let bestCost = Infinity;

      for (const tile of reachable) {
        const minDistanceToFriendly = Math.min(
          ...friendlyUnits.map(f => Math.abs(f.x - tile.x) + Math.abs(f.y - tile.y))
        );

        if (
          minDistanceToFriendly < bestDistance ||
          (minDistanceToFriendly === bestDistance && tile.cost < bestCost)
        ) {
          bestDistance = minDistanceToFriendly;
          bestCost = tile.cost;
          bestTile = tile;
        }
      }

      if (!bestTile) {
        return { ...enemy, hasActed: true };
      }

      const newEnemy = { ...enemy, x: bestTile.x, y: bestTile.y, hasActed: true };
      occupiedPositions.push({ x: newEnemy.x, y: newEnemy.y });
      return newEnemy;
    });

    setEnemyUnits(updatedEnemies.map(u => ({ ...u, hasActed: false })));
    setTurn(TURN.PLAYER);
    setFriendlyUnits(units => units.map(u => ({ ...u, hasActed: false })));
  }, [phase, turn, friendlyUnits, enemyUnits]);

  // Handle Escape key to cancel move mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && moveMode) {
        setMoveMode(false);
        setMovingUnit(null);
        setReachableTiles([]);
        setCurrentPath(null);
        selectedUnitRef.current = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveMode]);

useEffect(() => {
  const onResize = () => {
    resizeCanvas();
    redraw();
    updateScale();
  };

  window.addEventListener("resize", onResize);
  onResize();

  return () => window.removeEventListener("resize", onResize);
}, []);

  const handleMenuSelect = (action, unit) => {
    console.log(`${action} selected for unit`, unit.id);
    
    switch(action) {
      case "move":
        // Enter move mode
        setMoveMode(true);
        setMovingUnit(unit);
        
        // Calculate reachable tiles using A*
        const occupied = [...friendlyUnits, ...enemyUnits]
          .filter(u => u.id !== unit.id)
          .map(u => ({ x: u.x, y: u.y }));
        
        const tiles = getReachableTiles(unit.x, unit.y, unit.move, mapRef.current, occupied);
        setReachableTiles(tiles);
        
        // Close menu
        setMenuUnit(null);
        setMenuPosition(null);
        break;
      case "attack":
        // Show attack range
        console.log("Attack not yet implemented");
        break;
      case "info":
        // Show unit info panel
        setInfoPanelUnit(unit);
        setInfoPanelOpen(true);
        break;
      case "link":
        // Enemy link action
        console.log("Link not yet implemented");
        break;
      default:
        break;
    }
  };

  const handleTileHover = (tile) => {
    if (moveMode && movingUnit && mapRef.current) {
      // Check if tile is reachable
      const isReachable = reachableTiles.some(t => t.x === tile.x && t.y === tile.y);
      
      if (isReachable) {
        // Calculate path from unit to hovered tile
        const path = findPath(movingUnit.x, movingUnit.y, tile.x, tile.y, mapRef.current, movingUnit.move);
        setCurrentPath(path);
      } else {
        setCurrentPath(null);
      }
    }
  };

  const handleTileClick = (tile) => {
    if (moveMode && movingUnit) {
      // Check if clicked tile is reachable
      const isReachable = reachableTiles.some(t => t.x === tile.x && t.y === tile.y);

      if (isReachable) {
        const path = findPath(
          movingUnit.x,
          movingUnit.y,
          tile.x,
          tile.y,
          mapRef.current,
          movingUnit.move
        );

        if (!path || path.length <= 1) {
          return;
        }

        // Move unit to destination
        const destination = path[path.length - 1];
        
        setFriendlyUnits(units => 
          units.map(u => 
            u.id === movingUnit.id 
              ? { ...u, x: destination.x, y: destination.y, hasActed: true }
              : u
          )
        );
        
        // Exit move mode
        setMoveMode(false);
        setMovingUnit(null);
        setReachableTiles([]);
        setCurrentPath(null);
        selectedUnitRef.current = null;
      } else {
        // Clicked outside reachable area - cancel move mode
        setMoveMode(false);
        setMovingUnit(null);
        setReachableTiles([]);
        setCurrentPath(null);
        selectedUnitRef.current = null;
      }
    }
  };

  const handleUnitClick = (unit, screenX, screenY) => {
    if (unit && phase === PHASES.MAP_IDLE) {
      // Calculate menu dimensions (approximate)
      const menuWidth = 180;
      const menuHeight = unit.faction === FACTION.ENEMY ? 180 : 240; // Enemy menu is shorter
      const padding = 10;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Start with position to the right of click
      let x = screenX + padding;
      let y = screenY;
      
      // Check if menu would go off right edge
      if (x + menuWidth > viewportWidth) {
        x = screenX - menuWidth - padding; // Show on left instead
      }
      
      // Check if menu would go off bottom edge
      if (y + menuHeight > viewportHeight) {
        y = viewportHeight - menuHeight - padding; // Push up to fit
      }
      
      // Check if menu would go off top edge
      if (y < padding) {
        y = padding;
      }
      
      // Check if menu would go off left edge
      if (x < padding) {
        x = padding;
      }
      
      setMenuUnit(unit);
      setMenuPosition({ x, y });
      selectedUnitRef.current = unit;
      redraw();
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className={`battle-map ${phase}`} />
      <UnitMenu 
        unit={menuUnit}
        position={menuPosition}
        onSelect={handleMenuSelect}
        onClose={() => {
          setMenuUnit(null);
          setMenuPosition(null);
        }}
      />
      <InfoPanel 
        unit={infoPanelUnit}
        isOpen={infoPanelOpen}
        onClose={() => setInfoPanelOpen(false)}
      />
    </>
  );
}
