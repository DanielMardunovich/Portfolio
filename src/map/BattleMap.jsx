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

// Constants
const TILE_SIZE = 16;
const REVEAL_STAGGER_MS = 14;
const REVEAL_DROP_DURATION_MS = 260;
const REVEAL_START_Y_OFFSET = -32;
const MENU_WIDTH = 180;
const MENU_HEIGHT_FRIENDLY = 240;
const MENU_HEIGHT_ENEMY = 180;
const MENU_PADDING = 10;

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

  // Helper function to clear move mode state
  const clearMoveMode = () => {
    setMoveMode(false);
    setMovingUnit(null);
    setReachableTiles([]);
    setCurrentPath(null);
    selectedUnitRef.current = null;
  };

  // Helper function to calculate menu position
  const calculateMenuPosition = (screenX, screenY, faction) => {
    const menuWidth = MENU_WIDTH;
    const menuHeight = faction === FACTION.ENEMY ? MENU_HEIGHT_ENEMY : MENU_HEIGHT_FRIENDLY;
    const padding = MENU_PADDING;
    
    let x = screenX + padding;
    let y = screenY;
    
    // Prevent menu from going off screen edges
    if (x + menuWidth > window.innerWidth) {
      x = screenX - menuWidth - padding;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }
    if (x < padding) {
      x = padding;
    }
    
    return { x, y };
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    viewRef.current = getViewSize();
    canvas.width = viewRef.current.tilesX * TILE_SIZE;
    canvas.height = viewRef.current.tilesY * TILE_SIZE;
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
      { staggerMs: REVEAL_STAGGER_MS, dropDurationMs: REVEAL_DROP_DURATION_MS, startYOffset: REVEAL_START_Y_OFFSET }
    );
    
    // Only draw units after tile animation completes
    if (phase !== PHASES.MAP_INTRO) {
      drawUnits(ctx, friendlyUnits, unitSpriteRef.current, cameraRef.current, viewRef.current);
      drawUnits(ctx, enemyUnits, unitSpriteRef.current, cameraRef.current, viewRef.current);
    }

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
      const staggerMs = REVEAL_STAGGER_MS;
      const dropDurationMs = REVEAL_DROP_DURATION_MS;
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
      clearMoveMode();
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
        clearMoveMode();
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
        // TODO: Implement attack functionality
        break;
      case "info":
        // Show unit info panel
        setInfoPanelUnit(unit);
        setInfoPanelOpen(true);
        break;
      case "link":
        // TODO: Implement enemy link action
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
        clearMoveMode();
      } else {
        // Clicked outside reachable area - cancel move mode
        clearMoveMode();
      }
    }
  };

  const handleUnitClick = (unit, screenX, screenY) => {
    if (unit && phase === PHASES.MAP_IDLE) {
      const position = calculateMenuPosition(screenX, screenY, unit.faction);
      
      setMenuUnit(unit);
      setMenuPosition(position);
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
