import { useEffect, useRef } from "react";
import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import { createUnit, FACTION, UNIT_SPRITES } from "../game/units";
import { generateMap } from "./wfc/wfc";

import { MAP_WIDTH, MAP_HEIGHT, getViewSize } from "./battleConfig";
import { getMovementTiles } from "./battleMovement";
import { attachBattleInput } from "./battleInput";
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
    tilesetRef.current.src = "/Portfolio/TileMap/tilemap.png";
    unitSpriteRef.current.src = "/Portfolio/Units/units.png";

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;
      imagesLoadedRef.current = true;
      mapRef.current = generateMap(MAP_WIDTH, MAP_HEIGHT);
      redraw();
      setTimeout(() => setPhase(PHASES.MAP_IDLE), 300);
    };

    tilesetRef.current.onload = onLoad;
    unitSpriteRef.current.onload = onLoad;
  }, [phase]);

  useEffect(() => {
    if (phase !== PHASES.MAP_IDLE) return;

    setTurn(TURN.PLAYER);
    setFriendlyUnits([
      createUnit({ id: "p1", faction: FACTION.FRIENDLY, sprite: UNIT_SPRITES.FRIENDLY_SOLDIER, x: 8, y: 10 }),
      createUnit({ id: "p2", faction: FACTION.FRIENDLY, sprite: UNIT_SPRITES.FRIENDLY_ARCHER, x: 9, y: 10 })
    ]);
    setEnemyUnits([
      createUnit({ id: "e1", faction: FACTION.ENEMY, sprite: UNIT_SPRITES.ENEMY_SOLDIER, x: 20, y: 10 }),
      createUnit({ id: "e2", faction: FACTION.ENEMY, sprite: UNIT_SPRITES.ENEMY_ARCHER, x: 22, y: 12 })
    ]);
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
      redraw
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


  

  return <canvas ref={canvasRef} className={`battle-map ${phase}`} />;
}
