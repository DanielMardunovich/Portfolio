import { useEffect, useRef, useState } from "react";
import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import { createUnit, FACTION, UNIT_SPRITES } from "../game/units";
import { generateMap } from "./wfc/wfc";
import { generateValidatedMap, getTileWalkCost } from "./pathValidation";
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
  // InfoPanel state for portfolio project info
  const [infoPanelProject, setInfoPanelProject] = useState(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

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
      setEnemyUnits(units => 
        units.map(u => 
          u.id === enemy.id 
            ? { ...u, x: nextPos.x, y: nextPos.y }
            : u
        )
      );

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

    if (!mapRef.current || friendlyUnits.length === 0 || enemyUnits.length === 0) {
      setTurn(TURN.PLAYER);
      setFriendlyUnits(units => units.map(u => ({ ...u, hasActed: false })));
      setEnemyUnits(units => units.map(u => ({ ...u, hasActed: false })));
      return;
    }

    // Process enemies sequentially with animation
    const processEnemies = async () => {
      isAnimatingEnemyRef.current = true;
      
      const enemiesToMove = enemyUnits.filter(e => !e.hasActed);
      
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

        // Find best tile closest to friendly units
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
      setEnemyUnits(units => units.map(u => ({ ...u, hasActed: false })));
      setFriendlyUnits(units => units.map(u => ({ ...u, hasActed: false })));
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
        // Show portfolio info panel
        // Example: If the unit is friendly, show a project; if enemy, show contact info
        if (unit.faction === "friendly") {
          // Map unit to a project (for demo, just use first project)
          setInfoPanelProject(portfolioProjects[0]);
        } else {
          // Map enemy to contact info (for demo, just use first contact method)
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
