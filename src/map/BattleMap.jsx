import { useEffect, useRef, useState } from "react";
import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import { createUnit, FACTION, UNIT_SPRITES } from "../game/units";
import { generateMap } from "./wfc/wfc";
import { generateValidatedMap } from "./pathValidation";
import UnitMenu from "../ui/UnitMenu";

import { MAP_WIDTH, MAP_HEIGHT, getViewSize, getCenteredCamera } from "./battleConfig";
import { getMovementTiles } from "./battleMovement";
import { attachBattleInput } from "./battleInput";
import { SPAWN_AREAS, spawnUnitsInArea } from "./battleSpawn";
import {
  drawMap,
  drawUnits,
  drawCursor,
  drawSelection,
  drawMovementRange,
  drawGrid
} from "./battleRender";

import "../styles/battleMap.css";

export default function BattleMap() {
  const {
    phase,
    setPhase,
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

  const [menuUnit, setMenuUnit] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

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

    drawMap(ctx, mapRef.current, tilesetRef.current, cameraRef.current, viewRef.current, MAP_WIDTH, MAP_HEIGHT);
    drawUnits(ctx, friendlyUnits, unitSpriteRef.current, cameraRef.current, viewRef.current);
    drawUnits(ctx, enemyUnits, unitSpriteRef.current, cameraRef.current, viewRef.current);

    if (selectedUnitRef.current) {
      const tiles = getMovementTiles(selectedUnitRef.current, MAP_WIDTH, MAP_HEIGHT);
      drawMovementRange(ctx, tilesetRef.current, tiles, cameraRef.current);
      drawSelection(ctx, tilesetRef.current, selectedUnitRef.current, cameraRef.current);
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
      redraw();
      setTimeout(() => setPhase(PHASES.MAP_IDLE), 300);
    };

    tilesetRef.current.onload = onLoad;
    unitSpriteRef.current.onload = onLoad;
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
      redraw,
      onUnitClick: handleUnitClick
    });
  }, [friendlyUnits]);

  useEffect(() => {
    redraw();
  }, [friendlyUnits, enemyUnits]);

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
    // TODO: Implement action handlers
    switch(action) {
      case "move":
        // Show movement range
        break;
      case "attack":
        // Show attack range
        break;
      case "info":
        // Show unit info panel
        break;
      default:
        break;
    }
  };

  const handleUnitClick = (unit, screenX, screenY) => {
    if (unit && unit.faction === FACTION.FRIENDLY && phase === PHASES.MAP_IDLE) {
      // Calculate menu dimensions (approximate)
      const menuWidth = 180;
      const menuHeight = 240;
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
    </>
  );
}
