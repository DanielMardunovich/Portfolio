import { useEffect, useRef, useState } from "react";
import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import { createUnit, FACTION, UNIT_SPRITES } from "../game/units";
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
  drawPath
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
  const [enemySelectedUnit, setEnemySelectedUnit] = useState(null);
  const [enemyReachableTiles, setEnemyReachableTiles] = useState([]);
  const [attackTiles, setAttackTiles] = useState([]);
  // InfoPanel state for portfolio project info
  const [infoPanelProject, setInfoPanelProject] = useState(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubblePos, setBubblePos] = useState(null);
  const [bubbleUnitId, setBubbleUnitId] = useState(null);

  // Example: Define your portfolio projects and contact methods here
  // Friendly units = portfolio projects, enemies = you/contact methods
  // To add more, add objects to these arrays and link them to units on the map
  const portfolioProjects = [
    {
      title: "Pixel Art RPG Battle System",
      description: "A turn-based RPG battle system demo built with React, Vite, and custom pathfinding. Features animated tile placement, dynamic scaling, and AI movement.",
      image: "/Icons/project1.png", // Place your image in public/Icons/
      links: [
        { label: "GitHub", url: "https://github.com/yourusername/project1" },
        { label: "Live Demo", url: "https://your-portfolio.com/project1" }
      ],
      highlights: [
        "React + Vite frontend",
        "A* pathfinding for unit movement",
        "Procedural map generation"
      ]
    },
    // Add more project objects here
  ];
  const contactMethods = [
    {
      title: "Contact Me",
      description: "Let's connect! You can reach me via LinkedIn, email, or other platforms.",
      image: "/Icons/contact.png",
      links: [
        { label: "LinkedIn", url: "https://linkedin.com/in/yourprofile" },
        { label: "Email", url: "mailto:your@email.com" }
      ],
      highlights: [
        "Open to collaboration",
        "Available for freelance work"
      ]
    },
    // Add more contact/enemy objects here
  ];
  const enemyTurnHandledRef = useRef(false);
  const isAnimatingEnemyRef = useRef(false);
  const enemyAnimationTimeoutRef = useRef(null);

  // Helper function to clear move mode state
  const clearMoveMode = () => {
    setMoveMode(false);
    setMovingUnit(null);
    setReachableTiles([]);
    setCurrentPath(null);
    setAttackTiles([]);
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

    drawCursor(ctx, tilesetRef.current, cursorRef.current, cameraRef.current);
    drawGrid(ctx, viewRef.current.tilesX, viewRef.current.tilesY);

    // Draw movement overlays last so they appear above everything else.
    if (moveMode && movingUnit) {
      // Player movement tiles: blue
      drawColoredRange(ctx, reachableTiles, cameraRef.current, "rgba(0,100,255,0.35)");
      // Attack edge tiles: red, drawn on top of movement
      if (attackTiles && attackTiles.length > 0) {
        drawColoredRange(ctx, attackTiles, cameraRef.current, "rgba(255,0,0,0.45)");
      }

      drawSelection(ctx, tilesetRef.current, movingUnit, cameraRef.current);

      // Draw path with arrows
      if (currentPath && currentPath.length > 1) {
        drawPath(ctx, tilesetRef.current, currentPath, cameraRef.current, getArrowTileForPath);
      }
    }

    // Draw enemy selected movement range last (red overlay)
    if (enemySelectedUnit && enemyReachableTiles && enemyReachableTiles.length > 0) {
      drawColoredRange(ctx, enemyReachableTiles, cameraRef.current, "rgba(255,0,0,0.45)");
    }
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
    
    // Spawn friendly units in their area
    const friendlyConfigs = [
      createUnit({ id: "p1", faction: FACTION.FRIENDLY, sprite: UNIT_SPRITES.FRIENDLY_SOLDIER, x: 0, y: 0 }),
      createUnit({ id: "p2", faction: FACTION.FRIENDLY, sprite: UNIT_SPRITES.FRIENDLY_ARCHER, x: 0, y: 0 })
    ];
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
      setTurn(TURN.ENEMY);
      setMenuUnit(null);
      setMenuPosition(null);
      clearMoveMode();
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
        // Check if any friendly occupies the next position (ignore dead)
        const isOccupiedByFriendly = (friendlyUnits || []).some(f => !f.isDead && f.x === nextPos.x && f.y === nextPos.y);
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

  // Process enemy turns one at a time with animation
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
        // If any friendly is within this enemy's attack range, attack and skip movement
        const aliveFriendliesNow = friendlyUnits.filter(f => !f.isDead);
        const targetInRange = aliveFriendliesNow.find(f => Math.abs(f.x - enemy.x) + Math.abs(f.y - enemy.y) <= enemy.range);
        if (targetInRange) {
          // Apply damage to the friendly unit
          setFriendlyUnits(units => units.map(u => {
            if (u.id !== targetInRange.id) return u;
            const newHp = (u.hp ?? 0) - enemy.atk;
            return { ...u, hp: newHp, isDead: newHp <= 0, hasActed: newHp <= 0 ? true : u.hasActed };
          }));

          // Mark enemy as acted
          setEnemyUnits(units => units.map(u => u.id === enemy.id ? { ...u, hasActed: true } : u));

          // Small delay to separate actions visually
          await new Promise(resolve => setTimeout(resolve, ENEMY_TURN_DELAY_MS));
          continue; // skip movement for this enemy
        }

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
            // If we moved to attack, apply damage to the target (if still present and alive)
            if (attackTargetId) {
              setFriendlyUnits(units => units.map(u => {
                if (u.id !== attackTargetId) return u;
                const newHp = (u.hp ?? 0) - enemy.atk;
                return { ...u, hp: newHp, isDead: newHp <= 0, hasActed: newHp <= 0 ? true : u.hasActed };
              }));
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
        setMoveMode(true);
        setMovingUnit(unit);
        // Calculate reachable tiles using A*
        const occupied = [...friendlyUnits, ...enemyUnits.filter(e => !e.isDead)]
          .filter(u => u.id !== unit.id)
          .map(u => ({ x: u.x, y: u.y }));
        const tiles = getReachableTiles(unit.x, unit.y, unit.move, mapRef.current, occupied);
        setReachableTiles(tiles);
        // Compute attack edge: tiles 1-away from any reachable tile (not in reachable set)
        const reachableSet = new Set(tiles.map(t => `${t.x},${t.y}`));
        const edge = [];
        for (const t of tiles) {
          const neigh = [
            { x: t.x + 1, y: t.y },
            { x: t.x - 1, y: t.y },
            { x: t.x, y: t.y + 1 },
            { x: t.x, y: t.y - 1 }
          ];
          for (const n of neigh) {
            if (n.x < 0 || n.y < 0 || n.x >= MAP_WIDTH || n.y >= MAP_HEIGHT) continue;
            const key = `${n.x},${n.y}`;
            if (reachableSet.has(key)) continue;
            if (!edge.some(e => e.x === n.x && e.y === n.y)) edge.push(n);
          }
        }
        setAttackTiles(edge);
        // Close menu
        setMenuUnit(null);
        setMenuPosition(null);
        break;
      case "attack":
        // TODO: Implement attack functionality
        break;
      case "wait":
        // End unit's turn (same as after move)
        unit.hasActed = true;
        setMenuUnit(null);
        setMenuPosition(null);
        // Check if all friendly units have acted, then end turn
        if (friendlyUnits.every(u => u.hasActed)) {
          setTurn(TURN.ENEMY);
          clearMoveMode && clearMoveMode();
        }
        break;
      case "info":
        // Show portfolio info panel
        if (unit.faction === "friendly") {
          setInfoPanelProject(portfolioProjects[0]);
        } else {
          setInfoPanelProject(contactMethods[0]);
        }
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
        // Calculate path from unit to hovered tile (respect occupied tiles)
        const occupied = [...friendlyUnits, ...enemyUnits]
          .filter(u => u.id !== movingUnit.id)
          .map(u => ({ x: u.x, y: u.y }));
        const path = findPath(movingUnit.x, movingUnit.y, tile.x, tile.y, mapRef.current, movingUnit.move, occupied);
        setCurrentPath(path);
      } else {
        setCurrentPath(null);
      }
    }
  };

  const handleTileClick = (tile) => {
    // Clear enemy selection when clicking any tile (including when cancelling)
    setEnemySelectedUnit(null);
    setEnemyReachableTiles([]);

    if (moveMode && movingUnit) {
      // Check if clicked tile is reachable
      const isReachable = reachableTiles.some(t => t.x === tile.x && t.y === tile.y);

      if (isReachable) {
        const occupied = [...friendlyUnits, ...enemyUnits]
          .filter(u => u.id !== movingUnit.id)
          .map(u => ({ x: u.x, y: u.y }));
        const path = findPath(
          movingUnit.x,
          movingUnit.y,
          tile.x,
          tile.y,
          mapRef.current,
          movingUnit.move,
          occupied
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
      // If the bubble is visible for this unit, dismiss it permanently
      if (bubbleVisible && bubbleUnitId && unit.id === bubbleUnitId) {
        setBubbleVisible(false);
        setBubbleUnitId(null);
      }
      const position = calculateMenuPosition(screenX, screenY, unit.faction);
      // If in move mode and a player is moving, handle attack behavior
      if (moveMode && movingUnit && unit.faction === FACTION.ENEMY) {
        // Distance from current unit position
        const dist = Math.abs(movingUnit.x - unit.x) + Math.abs(movingUnit.y - unit.y);

        // Helper to apply damage to enemy and mark dead (don't remove)
        const applyDamageToEnemy = (enemyId, damage) => {
          setEnemyUnits(prev => prev.map(e => {
            if (e.id !== enemyId) return e;
            const newHp = (e.hp ?? 0) - damage;
            return { ...e, hp: newHp, isDead: newHp <= 0 };
          }));
        };

        // Attack in place if within range
        if (dist <= movingUnit.range) {
          applyDamageToEnemy(unit.id, movingUnit.atk);
          // Mark mover as acted and exit move mode
          setFriendlyUnits(prev => prev.map(u => u.id === movingUnit.id ? { ...u, hasActed: true } : u));
          clearMoveMode();
          return;
        }

        // Otherwise, see if any reachable tile allows an attack (tile within range of enemy)
        const attackTile = (reachableTiles || []).find(t => {
          const d = Math.abs(t.x - unit.x) + Math.abs(t.y - unit.y);
          return d <= movingUnit.range;
        });

        if (attackTile) {
          // Move the unit to the attack tile (instant) and then attack
          setFriendlyUnits(prev => prev.map(u => u.id === movingUnit.id ? { ...u, x: attackTile.x, y: attackTile.y, hasActed: true } : u));
          applyDamageToEnemy(unit.id, movingUnit.atk);
          clearMoveMode();
          return;
        }

        // No attack possible from move - fallthrough to showing menu
      }

      // If an enemy unit was clicked (not handled above), compute and show its reachable tiles in red.
      if (unit.faction === FACTION.ENEMY) {
        const occupied = [...friendlyUnits, ...enemyUnits]
          .filter(u => u.id !== unit.id)
          .map(u => ({ x: u.x, y: u.y }));
        const tiles = getReachableTiles(unit.x, unit.y, unit.move, mapRef.current, occupied);
        setEnemyReachableTiles(tiles);
        setEnemySelectedUnit(unit);
      } else {
        // Clicking a friendly unit should clear any enemy selection
        setEnemySelectedUnit(null);
        setEnemyReachableTiles([]);
      }

      setMenuUnit(unit);
      setMenuPosition(position);
      selectedUnitRef.current = unit;
      redraw();
    }
  };

  return (
    <>
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
        isOpen={infoPanelOpen}
        onClose={() => {
          setInfoPanelOpen(false);
          setInfoPanelProject(null);
        }}
      />
    </>
  );
}
