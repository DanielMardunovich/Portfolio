import { useEffect, useRef, useState } from "react";
import ProjectsMenu from "../ui/ProjectsMenu";
import "../styles/projectsMenu.css";
import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import { createUnit, FACTION, UNIT_SPRITES, createUnitFromType, listRegisteredUnitTypes } from "../game/units";
// Auto-load unit definitions (any .js file under src/game/units will be imported
// eagerly so it can call `registerUnitType` during module initialization).
// Uses Vite's `import.meta.glob` (works with Vite dev + build).
try {
  import.meta.glob("../game/units/*.js", { eager: true });
} catch (e) {
  // graceful fallback for environments without import.meta.glob
}
import { generateMap } from "./wfc/wfc";
import { generateValidatedMap, getTileWalkCost } from "./pathValidation";
import UnitMenu from "../ui/UnitMenu";
import InfoPanel from "../ui/InfoPanel";
import SpeechBubble from "../ui/SpeechBubble";
import "../styles/speechBubble.css";

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
  drawColoredRange,
  drawGrid,
  drawPath,
  drawDamageNumbers
} from "./battleRender";

import "../styles/battleMap.css";

// Constants
const TILE_SIZE = 16;
const REVEAL_STAGGER_MS = 60;
const REVEAL_DROP_DURATION_MS = 500;
const REVEAL_START_Y_OFFSET = -32;
const MENU_WIDTH = 180;
const MENU_HEIGHT_FRIENDLY = 240;
const MENU_HEIGHT_ENEMY = 180;
const MENU_PADDING = 10;
const ENEMY_MOVE_DELAY_MS = 200; // Time per tile for enemy movement
const ENEMY_TURN_DELAY_MS = 300; // Delay between enemy unit moves

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
  const friendlyUnitsRef = useRef([]);
  const enemyUnitsRef = useRef([]);
  const phaseRef = useRef(null);

  const cameraRef = useRef({ x: 0, y: 0 });
  const viewRef = useRef(getViewSize());

  const cursorRef = useRef({ x: 0, y: 0 });
  const selectedUnitRef = useRef(null);
  const hitAnimationsRef = useRef(new Map());
  const hitAnimatingRef = useRef(false);
  const shakeRef = useRef(new Map());
  const damageNumbersRef = useRef([]);
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
  const [enemySelectedUnit, setEnemySelectedUnit] = useState(null);
  const [enemyReachableTiles, setEnemyReachableTiles] = useState([]);
  const [attackTiles, setAttackTiles] = useState([]);

  // Refs that mirror overlay state so redraw() always reads fresh values even
  // when called from a stale RAF/input closure.
  const moveModeRef = useRef(false);
  const movingUnitRef = useRef(null);
  const reachableTilesRef = useRef([]);
  const reachableDisplayTilesRef = useRef([]); // non-water tiles only, for blue overlay
  const currentPathRef = useRef(null);
  const enemySelectedUnitRef = useRef(null);
  const enemyReachableTilesRef = useRef([]);
  const attackTilesRef = useRef([]);

  // Synced setters — update ref immediately, then React state for re-renders.
  const setMoveModeSync         = v => { moveModeRef.current          = v; setMoveMode(v); };
  const setMovingUnitSync       = v => { movingUnitRef.current        = v; setMovingUnit(v); };
  const setReachableTilesSync   = v => { reachableTilesRef.current    = v; setReachableTiles(v); };
  const setCurrentPathSync      = v => { currentPathRef.current       = v; setCurrentPath(v); };
  const setEnemySelectedSync    = v => { enemySelectedUnitRef.current = v; setEnemySelectedUnit(v); };
  const setEnemyReachableSync   = v => { enemyReachableTilesRef.current = v; setEnemyReachableTiles(v); };
  const setAttackTilesSync      = v => { attackTilesRef.current       = v; setAttackTiles(v); };
  // InfoPanel state for portfolio project info
  const [infoPanelProject, setInfoPanelProject] = useState(null);
  const [infoPanelUnit, setInfoPanelUnit] = useState(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(true);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubblePos, setBubblePos] = useState(null);
  const [bubbleUnitId, setBubbleUnitId] = useState(null);

  // Dynamically populate `portfolioProjects` from registered friendly unit types
  const portfolioProjects = (() => {
    const projects = [];
    try {
      const types = listRegisteredUnitTypes();
      for (const typeName of types) {
        try {
          const def = createUnitFromType(typeName, { id: typeName + "_preview" });
          if (def.faction !== FACTION.FRIENDLY) continue;
          const meta = def.meta || {};
          const info = meta.info || {};
          projects.push({
            title: info.name || typeName,
            image: (meta.images && meta.images[0]) || null,
            unitType: typeName,
            description: info.summary || info.description || "",
            links: info.links || []
          });
        } catch (e) {
          // skip problematic unit types
          console.warn("Failed to build project from unit type", typeName, e);
        }
      }
    } catch (e) {
      console.warn("Failed to list registered unit types", e);
    }
    return projects;
  })();
  const contactMethods = [];
  const enemyTurnHandledRef = useRef(false);
  const isAnimatingEnemyRef = useRef(false);
  const enemyAnimationTimeoutRef = useRef(null);
  const friendlyAnimationTimeoutRef = useRef(null);

  // Helper function to clear move mode state
  const clearMoveMode = () => {
    setMoveModeSync(false);
    setMovingUnitSync(null);
    setReachableTilesSync([]);
    reachableDisplayTilesRef.current = [];
    setCurrentPathSync(null);
    setAttackTilesSync([]);
    selectedUnitRef.current = null;
  };

  const triggerHitAnimation = (unitId) => {
    const DURATION = 300; // ms
    const end = performance.now() + DURATION;
    hitAnimationsRef.current.set(unitId, end);

    if (!hitAnimatingRef.current) {
      hitAnimatingRef.current = true;
      const loop = () => {
        const now = performance.now();
        for (const [id, e] of hitAnimationsRef.current.entries()) {
          if (e <= now) hitAnimationsRef.current.delete(id);
        }
        redraw();
        if (hitAnimationsRef.current.size > 0) {
          requestAnimationFrame(loop);
        } else {
          hitAnimatingRef.current = false;
        }
      };
      requestAnimationFrame(loop);
    } else {
      redraw();
    }
  };

  const triggerDamage = (unitId, amount) => {
    // Red flash
    triggerHitAnimation(unitId);

    const now = performance.now();
    const SHAKE_DURATION = 300;
    const SHAKE_MAG = 4;
    shakeRef.current.set(unitId, { start: now, end: now + SHAKE_DURATION, duration: SHAKE_DURATION, mag: SHAKE_MAG });

    // Find unit position at time of hit — use refs for fresh data
    const unit = [...friendlyUnitsRef.current, ...enemyUnitsRef.current].find(u => u.id === unitId);
    const x = unit ? unit.x : 0;
    const y = unit ? unit.y : 0;

    const dmgEntry = { id: Math.random().toString(36).substr(2,9), unitId, amount, start: now, duration: 800, x, y };
    damageNumbersRef.current.push(dmgEntry);

    redraw();
  };

  // Wait until visual animations (hit/shake/damage numbers) complete before proceeding
  const waitForAnimationsThen = (cb) => {
    const check = () => {
      const hasHit = hitAnimationsRef.current && hitAnimationsRef.current.size > 0;
      const hasShake = shakeRef.current && shakeRef.current.size > 0;
      const hasDmg = damageNumbersRef.current && damageNumbersRef.current.length > 0;
      if (hasHit || hasShake || hasDmg) {
        requestAnimationFrame(check);
      } else {
        cb();
      }
    };
    requestAnimationFrame(check);
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
      // Move menu further up by increasing offset
      y = window.innerHeight - menuHeight - (padding * 3);
    }
    if (y < padding) {
      y = padding;
    }
    if (x < padding) {
      x = padding;
    }
    
    return { x, y };
  };

  const tileToClient = (tileX, tileY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const px = (tileX - cameraRef.current.x + 0.5) * TILE_SIZE;
    const py = (tileY - cameraRef.current.y + 0.0) * TILE_SIZE;

    const clientX = rect.left + px / scaleX;
    const clientY = rect.top + py / scaleY;

    return { x: clientX, y: clientY };
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

    const nowForHit = performance.now();
    const hitMap = new Map();
    for (const [id, end] of hitAnimationsRef.current.entries()) {
      const remaining = Math.max(0, end - nowForHit);
      const opacity = Math.min(1, remaining / 300);
      if (opacity > 0) hitMap.set(id, opacity * 0.85);
    }

    // Compute shake offsets per unit and prune finished shakes
    const nowForShake = performance.now();
    const shakeOffsets = new Map();
    for (const [id, obj] of shakeRef.current.entries()) {
      const remaining = obj.end - nowForShake;
      if (remaining <= 0) {
        shakeRef.current.delete(id);
        continue;
      }
      const elapsed = nowForShake - obj.start;
      const t = Math.min(1, elapsed / obj.duration);
      const amp = obj.mag * (1 - t);
      const dx = (Math.random() * 2 - 1) * amp;
      const dy = (Math.random() * 2 - 1) * amp;
      shakeOffsets.set(id, { dx, dy });
    }

    // Prune expired damage numbers
    const nowForDmg = performance.now();
    damageNumbersRef.current = damageNumbersRef.current.filter(d => (nowForDmg - d.start) < d.duration);

    const revealTime = phaseRef.current === PHASES.MAP_INTRO ? mapRevealTimeRef.current : null;
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
    if (phaseRef.current !== PHASES.MAP_INTRO) {
      drawUnits(ctx, friendlyUnitsRef.current, unitSpriteRef.current, cameraRef.current, viewRef.current, hitMap, shakeOffsets);
      drawUnits(ctx, enemyUnitsRef.current, unitSpriteRef.current, cameraRef.current, viewRef.current, hitMap, shakeOffsets);
    }

    drawCursor(ctx, tilesetRef.current, cursorRef.current, cameraRef.current);
    drawGrid(ctx, viewRef.current.tilesX, viewRef.current.tilesY);

    // Draw movement overlays last so they appear above everything else.
    // Read from refs so any RAF/closure always sees the latest values.
    if (moveModeRef.current && movingUnitRef.current) {
      // Player movement tiles: blue (display set excludes water tiles)
      drawColoredRange(ctx, reachableDisplayTilesRef.current.length ? reachableDisplayTilesRef.current : reachableTilesRef.current, cameraRef.current, "rgba(0,100,255,0.35)");
      // Attack edge tiles: red, drawn on top of movement
      if (attackTilesRef.current && attackTilesRef.current.length > 0) {
        drawColoredRange(ctx, attackTilesRef.current, cameraRef.current, "rgba(255,0,0,0.45)");
      }

      // Draw path with arrows
      if (currentPathRef.current && currentPathRef.current.length > 1) {
        drawPath(ctx, tilesetRef.current, currentPathRef.current, cameraRef.current, getArrowTileForPath);
      }
    }

    // Draw enemy selected movement range last (red overlay)
    if (enemySelectedUnitRef.current && enemyReachableTilesRef.current && enemyReachableTilesRef.current.length > 0) {
      drawColoredRange(ctx, enemyReachableTilesRef.current, cameraRef.current, "rgba(255,0,0,0.45)");
    }

    // Draw floating damage numbers above everything
    drawDamageNumbers(ctx, damageNumbersRef.current, cameraRef.current);
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
      // For vertical sweep: maxDelay is (view.tilesX - 1) * staggerMs
      const maxDelay = (view.tilesX - 1) * staggerMs;
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
    
    // Clear any existing units
    setFriendlyUnits([]);
    setEnemyUnits([]);

    // Spawn all registered unit types. Each registered type is instantiated
    // (defaults come from the Unit class) and then placed into the appropriate
    // spawn area based on its `faction` value.
    const registered = listRegisteredUnitTypes();
    const friendlyConfigs = [];
    const enemyConfigs = [];

    registered.forEach((typeName, idx) => {
      try {
        const id = `${typeName}_${idx}`;
        const def = createUnitFromType(typeName, { id, x: 0, y: 0 });
        const config = {
          id: def.id,
          type: def.type,
          faction: def.faction,
          sprite: def.sprite,
          hp: def.hp,
          atk: def.atk,
          move: def.move,
          range: def.range,
          meta: def.meta // include images/info for UI
        };

        if (def.faction === FACTION.ENEMY) enemyConfigs.push(config);
        else friendlyConfigs.push(config);
      } catch (err) {
        console.warn("Failed to instantiate registered unit", typeName, err);
      }
    });

    const spawnedFriendly = spawnUnitsInArea(friendlyConfigs, SPAWN_AREAS.FRIENDLY, mapRef.current);
    setFriendlyUnits(spawnedFriendly);
    // Show speech bubble above first friendly unit
    if (spawnedFriendly.length > 0) {
      const target = spawnedFriendly[0];
      const pos = tileToClient(target.x, target.y);
      if (pos) {
        setBubbleUnitId(target.id);
        setBubblePos({ x: pos.x, y: pos.y - 18 });
        setBubbleVisible(true);
      }
    }
    
    // Spawn enemy units in their area
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
      friendlyUnitsRef,
      enemyUnitsRef,
      redraw,
      onUnitClick: handleUnitClick,
      onTileHover: handleTileHover,
      onTileClick: handleTileClick,
      moveMode
    });
  }, [friendlyUnits, enemyUnits, moveMode, movingUnit, reachableTiles, phase, turn]);

  useEffect(() => {
    redraw();
  }, [friendlyUnits, enemyUnits, moveMode, currentPath, enemySelectedUnit, enemyReachableTiles, attackTiles]);

  useEffect(() => {
    if (phase !== PHASES.MAP_IDLE) return;
    if (turn !== TURN.PLAYER) return;
    if (moveMode || movingUnit) return;
    if (!mapRef.current) return;

    const aliveFriendlies = friendlyUnits.filter(f => !f.isDead);
    if (aliveFriendlies.length === 0) return;

    const allFriendlyCannotMove = aliveFriendlies.every(unit => {
      if (unit.hasActed) return true;

      const occupied = [...friendlyUnits, ...enemyUnits]
        .filter(u => u.id !== unit.id)
        .map(u => ({ x: u.x, y: u.y }));

      const tiles = getReachableTiles(unit.x, unit.y, unit.move, mapRef.current, occupied);
      return tiles.length === 0;
    });

    if (allFriendlyCannotMove) {
      // Wait for any pending visual animations (damage/shake) before switching to enemy turn
      waitForAnimationsThen(() => {
        setTurn(TURN.ENEMY);
        setMenuUnit(null);
        setMenuPosition(null);
        clearMoveMode();
      });
    }
  }, [phase, turn, friendlyUnits, enemyUnits, moveMode, movingUnit]);

  // Animate enemy unit along path
  const animateEnemyMovement = (enemy, path, onComplete) => {
    if (!path || path.length <= 1) {
      onComplete();
      return;
    }

    let stepIndex = 1; // Start from 1 (skip current position)

    const moveStep = () => {
      if (stepIndex >= path.length) {
        onComplete();
        return;
      }

      const nextPos = path[stepIndex];
      let canMove = true;
      setEnemyUnits(units => {
        // Check if any other enemy occupies the next position (ignore dead)
        const isOccupiedByEnemy = units.some(u => u.id !== enemy.id && u.x === nextPos.x && u.y === nextPos.y);
        // Check if any friendly occupies the next position — use ref for fresh data
        const isOccupiedByFriendly = friendlyUnitsRef.current.some(f => !f.isDead && f.x === nextPos.x && f.y === nextPos.y);
        if (isOccupiedByEnemy || isOccupiedByFriendly) {
          canMove = false;
          return units;
        }
        return units.map(u =>
          u.id === enemy.id
            ? { ...u, x: nextPos.x, y: nextPos.y }
            : u
        );
      });

      if (!canMove) {
        // Mark as acted and stop movement if blocked
        setEnemyUnits(units => units.map(u => u.id === enemy.id ? { ...u, hasActed: true } : u));
        onComplete();
        return;
      }

      stepIndex++;
      enemyAnimationTimeoutRef.current = setTimeout(moveStep, ENEMY_MOVE_DELAY_MS);
    };

    moveStep();
  };

  // Animate friendly (player) unit along path
  const animateFriendlyMovement = (unit, path, onComplete) => {
    if (!path || path.length <= 1) {
      onComplete();
      return;
    }

    let stepIndex = 1;

    const moveStep = () => {
      if (stepIndex >= path.length) {
        onComplete();
        return;
      }

      const nextPos = path[stepIndex];

      // Check occupancy using refs for fresh data (closure values go stale across setTimeout steps)
      const occupiedByFriendly = friendlyUnitsRef.current.some(u => u.id !== unit.id && u.x === nextPos.x && u.y === nextPos.y);
      const occupiedByEnemy = enemyUnitsRef.current.some(e => !e.isDead && e.x === nextPos.x && e.y === nextPos.y);

      if (occupiedByFriendly || occupiedByEnemy) {
        setFriendlyUnits(units => units.map(u => u.id === unit.id ? { ...u, hasActed: true } : u));
        onComplete();
        return;
      }

      // Move unit one step
      setFriendlyUnits(units => units.map(u => u.id === unit.id ? { ...u, x: nextPos.x, y: nextPos.y } : u));
      // Keep movingUnitRef in sync so redraw shows the unit at the right spot
      if (movingUnitRef.current && movingUnitRef.current.id === unit.id) {
        movingUnitRef.current = { ...movingUnitRef.current, x: nextPos.x, y: nextPos.y };
      }

      stepIndex++;
      friendlyAnimationTimeoutRef.current = setTimeout(moveStep, ENEMY_MOVE_DELAY_MS);
    };

    moveStep();
  };

  // Keep unit and phase refs in sync so redraw() always has fresh data regardless of closure age
  useEffect(() => { friendlyUnitsRef.current = friendlyUnits; }, [friendlyUnits]);
  useEffect(() => { enemyUnitsRef.current = enemyUnits; }, [enemyUnits]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Idle animation loop — keeps units wiggling and damage numbers animating
  // even when the user isn't moving the mouse.
  const rafRef = useRef(null);
  useEffect(() => {
    const needsAnimation = () => {
      const hasIdle = (friendlyUnits || []).some(u => !u.isDead && !u.hasActed)
                   || (enemyUnits || []).some(u => !u.isDead && !u.hasActed);
      const hasHit   = hitAnimationsRef.current.size > 0;
      const hasShake = shakeRef.current.size > 0;
      const hasDmg   = damageNumbersRef.current.length > 0;
      return hasIdle || hasHit || hasShake || hasDmg;
    };

    const loop = () => {
      redraw();
      rafRef.current = requestAnimationFrame(loop);
    };

    if (needsAnimation()) {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [friendlyUnits, enemyUnits, phase]);
  useEffect(() => {
    if (phase !== PHASES.MAP_IDLE) return;
    if (turn !== TURN.ENEMY) {
      enemyTurnHandledRef.current = false;
      return;
    }
    if (enemyTurnHandledRef.current) return;
    if (isAnimatingEnemyRef.current) return;
    
    enemyTurnHandledRef.current = true;

    const aliveEnemies = enemyUnits.filter(e => !e.isDead);
    const aliveFriendlies = friendlyUnits.filter(f => !f.isDead);
    if (!mapRef.current || aliveFriendlies.length === 0 || aliveEnemies.length === 0) {
      setTurn(TURN.PLAYER);
      setFriendlyUnits(units => units.map(u => u.isDead ? { ...u, hasActed: true } : { ...u, hasActed: false }));
      setEnemyUnits(units => units.map(u => u.isDead ? { ...u, hasActed: true } : { ...u, hasActed: false }));
      return;
    }

    // Process enemies sequentially with animation
    const processEnemies = async () => {
      isAnimatingEnemyRef.current = true;
      
      const enemiesToMove = enemyUnits.filter(e => !e.hasActed && !e.isDead);
      
      for (const enemy of enemiesToMove) {
        

        // Get all occupied positions (excluding current enemy)
        const occupied = [...friendlyUnits, ...enemyUnits]
          .filter(u => u.id !== enemy.id)
          .map(u => ({ x: u.x, y: u.y }));

        const reachable = getReachableTiles(enemy.x, enemy.y, enemy.move, mapRef.current, occupied);
        
        if (reachable.length === 0) {
          // Mark as acted if can't move
          setEnemyUnits(units => 
            units.map(u => u.id === enemy.id ? { ...u, hasActed: true } : u)
          );
          continue;
        }

        // Find best tile. Prefer reachable tiles that allow attacking a friendly after moving.
        let bestTile = null;
        let bestDistance = Infinity;
        let bestCost = Infinity;
        let attackTargetId = null;

        const aliveFriendliesForRange = friendlyUnits.filter(f => !f.isDead);

        // Look for reachable tiles that place the enemy within attack range of any alive friendly
        const attackOptions = [];
        for (const tile of reachable) {
          for (const f of aliveFriendliesForRange) {
            const d = Math.abs(f.x - tile.x) + Math.abs(f.y - tile.y);
            if (d <= enemy.range) {
              attackOptions.push({ tile, target: f, cost: tile.cost });
            }
          }
        }

        if (attackOptions.length > 0) {
          // Pick cheapest option, tiebreaker by proximity to enemy
          attackOptions.sort((a, b) => a.cost - b.cost || (Math.abs(a.target.x - enemy.x) + Math.abs(a.target.y - enemy.y)) - (Math.abs(b.target.x - enemy.x) + Math.abs(b.target.y - enemy.y)));
          bestTile = attackOptions[0].tile;
          attackTargetId = attackOptions[0].target.id;
        } else {
          // No direct attack move available; pick tile that minimizes distance to nearest alive friendly
          if (aliveFriendliesForRange.length === 0) {
            // No alive friendlies - mark acted
            setEnemyUnits(units => 
              units.map(u => u.id === enemy.id ? { ...u, hasActed: true } : u)
            );
            continue;
          }

          for (const tile of reachable) {
            const minDistanceToFriendly = Math.min(
              ...aliveFriendliesForRange.map(f => Math.abs(f.x - tile.x) + Math.abs(f.y - tile.y))
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
        }

        if (!bestTile) {
          setEnemyUnits(units => 
            units.map(u => u.id === enemy.id ? { ...u, hasActed: true } : u)
          );
          continue;
        }


        // Custom pathfinding that blocks occupied tiles (except start)
        const occupiedSet = new Set(occupied.map(pos => `${pos.x},${pos.y}`));
        const path = (() => {
          const width = mapRef.current[0].length;
          const height = mapRef.current.length;
          const key = (x, y) => `${x},${y}`;
          const openSet = new Set();
          const closedSet = new Set();
          const nodes = new Map();
          const startNode = {
            x: enemy.x,
            y: enemy.y,
            g: 0,
            h: Math.abs(bestTile.x - enemy.x) + Math.abs(bestTile.y - enemy.y),
            f: 0,
            parent: null
          };
          startNode.f = startNode.g + startNode.h;
          nodes.set(key(enemy.x, enemy.y), startNode);
          openSet.add(key(enemy.x, enemy.y));
          while (openSet.size > 0) {
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
            if (current.x === bestTile.x && current.y === bestTile.y) {
              // reconstruct path
              const path = [];
              let c = current;
              while (c !== null) {
                path.unshift({ x: c.x, y: c.y });
                c = c.parent;
              }
              return path;
            }
            openSet.delete(currentKey);
            closedSet.add(currentKey);
            const neighbors = [
              { x: current.x + 1, y: current.y },
              { x: current.x - 1, y: current.y },
              { x: current.x, y: current.y + 1 },
              { x: current.x, y: current.y - 1 }
            ];
            for (const neighbor of neighbors) {
              const { x, y } = neighbor;
              if (x < 0 || x >= width || y < 0 || y >= height) continue;
              // Block occupied tiles except for the starting tile
              if (!(x === enemy.x && y === enemy.y) && occupiedSet.has(key(x, y))) continue;
              const neighborKey = key(x, y);
              if (closedSet.has(neighborKey)) continue;
              const tileCost = getTileWalkCost(mapRef.current[y][x]);
              const tentativeG = current.g + tileCost;
              if (tentativeG > enemy.move) continue;
              let neighborNode = nodes.get(neighborKey);
              if (!neighborNode) {
                neighborNode = {
                  x,
                  y,
                  g: Infinity,
                  h: Math.abs(bestTile.x - x) + Math.abs(bestTile.y - y),
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
          return null;
        })();

        // Animate movement along path
        await new Promise(resolve => {
          animateEnemyMovement(enemy, path, () => {
            // Ensure enemy is placed at destination after animation
            const destination = (path && path.length) ? path[path.length - 1] : bestTile;
            if (destination) {
              setEnemyUnits(units => units.map(u => u.id === enemy.id ? { ...u, x: destination.x, y: destination.y } : u));
            }

            // If we moved to attack, apply damage to the target (if still present and alive)
            if (attackTargetId) {
              setFriendlyUnits(units => units.map(u => {
                if (u.id !== attackTargetId) return u;
                const newHp = (u.hp ?? 0) - enemy.atk;
                return { ...u, hp: newHp, isDead: newHp <= 0, hasActed: newHp <= 0 ? true : u.hasActed };
              }));
              triggerDamage(attackTargetId, enemy.atk);
            }

            // Mark as acted after animation
            setEnemyUnits(units => 
              units.map(u => u.id === enemy.id ? { ...u, hasActed: true } : u)
            );
            resolve();
          });
        });

        // Small delay between enemy moves
        await new Promise(resolve => setTimeout(resolve, ENEMY_TURN_DELAY_MS));
      }

      // All enemies moved, end turn
      isAnimatingEnemyRef.current = false;
      setEnemyUnits(units => units.map(u => u.isDead ? { ...u, hasActed: true } : { ...u, hasActed: false }));
      setFriendlyUnits(units => units.map(u => u.isDead ? { ...u, hasActed: true } : { ...u, hasActed: false }));
      setTurn(TURN.PLAYER);
    };

    processEnemies();
  }, [phase, turn, friendlyUnits, enemyUnits]);

  // Cleanup enemy animation on unmount
  useEffect(() => {
    return () => {
      if (enemyAnimationTimeoutRef.current) {
        clearTimeout(enemyAnimationTimeoutRef.current);
        enemyAnimationTimeoutRef.current = null;
      }
      if (friendlyAnimationTimeoutRef.current) {
        clearTimeout(friendlyAnimationTimeoutRef.current);
        friendlyAnimationTimeoutRef.current = null;
      }
    };
  }, []);

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

  // Ensure Projects menu closes whenever an InfoPanel opens
  useEffect(() => {
    if (infoPanelOpen) setProjectsMenuOpen(false);
  }, [infoPanelOpen]);

  const handleMenuSelect = (action, unit) => {
    switch(action) {
      case "move":
        // If the unit is dead, force it to wait and do not enter move mode
        if (unit.isDead) {
          setFriendlyUnits(units => units.map(u => u.id === unit.id ? { ...u, hasActed: true } : u));
          setMenuUnit(null);
          setMenuPosition(null);
          return;
        }

        // Enter move mode
        setMoveModeSync(true);
        setMovingUnitSync(unit);
        // Calculate reachable tiles using A*
        const occupied = [...friendlyUnitsRef.current, ...enemyUnitsRef.current.filter(e => !e.isDead)]
          .filter(u => u.id !== unit.id)
          .map(u => ({ x: u.x, y: u.y }));
        const allReachable = getReachableTiles(unit.x, unit.y, unit.move, mapRef.current, occupied);
        setReachableTilesSync(allReachable);
        // Display tiles: exclude water so the overlay doesn't darken water tiles
        const MAX_DISPLAY_COST = 2;
        reachableDisplayTilesRef.current = allReachable.filter(t => {
          const cost = getTileWalkCost(mapRef.current[t.y]?.[t.x]);
          return cost <= MAX_DISPLAY_COST;
        });
        // Compute attack tiles from walkable sources only
        const reachableSet = new Set(allReachable.map(t => `${t.x},${t.y}`));
        const attackSet = new Set();
        const withinBounds = (x, y) => x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT;
        const range = (unit?.range ?? 1);
        const attackSources = [{ x: unit.x, y: unit.y }, ...reachableDisplayTilesRef.current];

        for (const t of attackSources) {
          for (let dx = -range; dx <= range; dx++) {
            const maxDy = range - Math.abs(dx);
            for (let dy = -maxDy; dy <= maxDy; dy++) {
              const nx = t.x + dx;
              const ny = t.y + dy;
              if (!withinBounds(nx, ny)) continue;
              const key = `${nx},${ny}`;
              if (reachableSet.has(key)) continue;
              attackSet.add(key);
            }
          }
        }

        const edge = Array.from(attackSet).map(k => {
          const [x, y] = k.split(",").map(Number);
          return { x, y };
        });
        setAttackTilesSync(edge);
        // Close menu
        setMenuUnit(null);
        setMenuPosition(null);
        requestAnimationFrame(() => redraw());
        break;
      case "attack":
        // TODO: Implement attack functionality
        break;
      case "wait":
        // End unit's turn — mutate via setter so React tracks the change
        setFriendlyUnits(units => units.map(u => u.id === unit.id ? { ...u, hasActed: true } : u));
        setMenuUnit(null);
        setMenuPosition(null);
        // Use ref for the all-acted check so we see the latest values
        if (friendlyUnitsRef.current.every(u => u.hasActed || u.id === unit.id)) {
          waitForAnimationsThen(() => {
            setTurn(TURN.ENEMY);
            clearMoveMode();
          });
        }
        break;
      case "info":
        // Open the info panel with the clicked unit's meta (preferred)
        setInfoPanelUnit(unit);
        setInfoPanelProject(null);
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
    if (moveModeRef.current && movingUnitRef.current && mapRef.current) {
      const isReachable = reachableTilesRef.current.some(t => t.x === tile.x && t.y === tile.y);
      if (isReachable) {
        const occupied = [...friendlyUnitsRef.current, ...enemyUnitsRef.current]
          .filter(u => u.id !== movingUnitRef.current.id)
          .map(u => ({ x: u.x, y: u.y }));
        const path = findPath(movingUnitRef.current.x, movingUnitRef.current.y, tile.x, tile.y, mapRef.current, movingUnitRef.current.move, occupied);
        setCurrentPathSync(path);
      } else {
        setCurrentPathSync(null);
      }
    }
  };

  const handleTileClick = (tile) => {
    // Clear enemy selection when clicking any tile
    setEnemySelectedSync(null);
    setEnemyReachableSync([]);

    if (moveModeRef.current && movingUnitRef.current) {
      const isReachable = reachableTilesRef.current.some(t => t.x === tile.x && t.y === tile.y);

      if (isReachable) {
        const unit = movingUnitRef.current;
        const occupied = [...friendlyUnitsRef.current, ...enemyUnitsRef.current]
          .filter(u => u.id !== unit.id)
          .map(u => ({ x: u.x, y: u.y }));
        const path = findPath(unit.x, unit.y, tile.x, tile.y, mapRef.current, unit.move, occupied);

        if (!path || path.length <= 1) return;

        // Clear overlays immediately so they vanish the moment the unit starts walking
        setReachableTilesSync([]);
        reachableDisplayTilesRef.current = [];
        setAttackTilesSync([]);
        setCurrentPathSync(null);

        animateFriendlyMovement(unit, path, () => {
          setFriendlyUnits(units => units.map(u => u.id === unit.id ? { ...u, hasActed: true } : u));
          clearMoveMode();
        });
      } else {
        // Clicked outside reachable area - cancel move mode
        clearMoveMode();
      }
    }
  };

  const handleUnitClick = (unit, screenX, screenY) => {
    if (unit && phase === PHASES.MAP_IDLE) {
      // If the bubble is visible for this unit, dismiss it permanently
      if (bubbleVisible && bubbleUnitId && unit.id === bubbleUnitId) {
        setBubbleVisible(false);
        setBubbleUnitId(null);
      }
      const position = calculateMenuPosition(screenX, screenY, unit.faction);
      // If in move mode and a player is moving, handle attack behavior
      if (moveModeRef.current && movingUnitRef.current && unit.faction === FACTION.ENEMY) {
        const mover = movingUnitRef.current;
        const dist = Math.abs(mover.x - unit.x) + Math.abs(mover.y - unit.y);

        const applyDamageToEnemy = (enemyId, damage) => {
          setEnemyUnits(prev => prev.map(e => {
            if (e.id !== enemyId) return e;
            const newHp = (e.hp ?? 0) - damage;
            return { ...e, hp: newHp, isDead: newHp <= 0 };
          }));
        };

        // Attack in place if within range
        if (dist <= mover.range) {
          applyDamageToEnemy(unit.id, mover.atk);
          triggerDamage(unit.id, mover.atk);
          setFriendlyUnits(prev => prev.map(u => u.id === mover.id ? { ...u, hasActed: true } : u));
          clearMoveMode();
          return;
        }

        // Otherwise, see if any reachable tile allows an attack (tile within range of enemy)
        const attackTile = reachableTilesRef.current.find(t => {
          const d = Math.abs(t.x - unit.x) + Math.abs(t.y - unit.y);
          return d <= mover.range;
        });

        if (attackTile) {
          const occupied = [...friendlyUnitsRef.current, ...enemyUnitsRef.current]
            .filter(u => u.id !== mover.id)
            .map(u => ({ x: u.x, y: u.y }));

          const path = findPath(mover.x, mover.y, attackTile.x, attackTile.y, mapRef.current, mover.move, occupied);

          if (!path || path.length <= 1) {
            setFriendlyUnits(prev => prev.map(u => u.id === mover.id ? { ...u, x: attackTile.x, y: attackTile.y, hasActed: true } : u));
            applyDamageToEnemy(unit.id, mover.atk);
            triggerDamage(unit.id, mover.atk);
            clearMoveMode();
            return;
          }

          // Clear overlays immediately before walk starts
          setReachableTilesSync([]);
          reachableDisplayTilesRef.current = [];
          setAttackTilesSync([]);
          setCurrentPathSync(null);

          animateFriendlyMovement(mover, path, () => {
            setFriendlyUnits(prev => prev.map(u => u.id === mover.id ? { ...u, hasActed: true } : u));
            applyDamageToEnemy(unit.id, mover.atk);
            triggerDamage(unit.id, mover.atk);
            clearMoveMode();
          });

          return;
        }

        // No attack possible from move - fallthrough to showing menu
      }

      // If an enemy unit was clicked (not handled above), compute and show its reachable tiles in red.
      if (unit.faction === FACTION.ENEMY) {
        const occupied = [...friendlyUnitsRef.current, ...enemyUnitsRef.current]
          .filter(u => u.id !== unit.id)
          .map(u => ({ x: u.x, y: u.y }));
        const tiles = getReachableTiles(unit.x, unit.y, unit.move, mapRef.current, occupied);
        setEnemyReachableSync(tiles);
        setEnemySelectedSync(unit);
      } else {
        // Clicking a friendly unit should clear any enemy selection
        setEnemySelectedSync(null);
        setEnemyReachableSync([]);
      }

      setMenuUnit(unit);
      setMenuPosition(position);
      selectedUnitRef.current = unit;
      redraw();
    }
  };

  return (
    <>
      <button
        className="projects-menu-toggle"
        style={{ left: projectsMenuOpen ? 300 : 0 }}
        onClick={() => setProjectsMenuOpen((v) => !v)}
        aria-label={projectsMenuOpen ? "Close Projects Menu" : "Open Projects Menu"}
      >
        <span>{projectsMenuOpen ? "←" : "→"}</span>
      </button>
      <ProjectsMenu
        projects={portfolioProjects}
        isOpen={projectsMenuOpen}
        onClose={() => setProjectsMenuOpen(false)}
        onProjectClick={(proj) => {
          let unit = null;
          try {
            unit = createUnitFromType(proj.unitType, { id: proj.unitType + "_preview" });
          } catch (e) {
            console.warn("Failed to create preview unit for project", proj, e);
          }
          setInfoPanelUnit(unit);
          setInfoPanelProject(null);
          setInfoPanelOpen(true);
          setProjectsMenuOpen(false);
        }}
        onProfileClick={() => {
          // Open the DanielMardunovich enemy info panel when profile is clicked
          let unit = null;
          try {
            unit = createUnitFromType("DanielMardunovich", { id: "DanielMardunovich_preview" });
          } catch (e) {
            console.warn("Failed to create DanielMardunovich preview unit", e);
          }
          setInfoPanelUnit(unit);
          setInfoPanelProject(null);
          setInfoPanelOpen(true);
          setProjectsMenuOpen(false);
        }}
      />
      <canvas ref={canvasRef} className={`battle-map ${phase}`} />
      <SpeechBubble
        visible={bubbleVisible}
        x={bubblePos?.x}
        y={bubblePos?.y}
        text={"Click me!"}
        onDismiss={() => {
          setBubbleVisible(false);
          setBubbleUnitId(null);
        }}
      />
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
        project={infoPanelProject}
        unit={infoPanelUnit}
        isOpen={infoPanelOpen}
        onClose={() => {
          setInfoPanelOpen(false);
          setInfoPanelProject(null);
          setInfoPanelUnit(null);
        }}
      />
    </>
  );
}