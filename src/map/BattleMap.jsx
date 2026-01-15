import { useEffect, useRef } from "react";
import { useGame } from "../game/GameContext";
import { PHASES, TURN } from "../game/phases";
import { createUnit, FACTION } from "../game/units";
import { generateMap } from "./wfc";
import { TILE_SIZE, TILES } from "./tiles";
import { UNIT_SPRITES } from "../game/units";
import { MOUSE_TILES } from "./tiles";


import "../styles/battleMap.css";


/* =========================
   CONFIG
========================= */

const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;

/* =========================
   VIEW SIZE
========================= */

const getViewSize = () => {
  const tilesX = Math.ceil(window.innerWidth / TILE_SIZE);
  const tilesY = Math.ceil(window.innerHeight / TILE_SIZE);

  return {
    tilesX: Math.min(tilesX, MAP_WIDTH),
    tilesY: Math.min(tilesY, MAP_HEIGHT),
  };
};

/* =========================
   GRID
========================= */

function drawGrid(ctx, w, h, s) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  for (let x = 0; x <= w; x++) {
    ctx.beginPath();
    ctx.moveTo(x * s + 0.5, 0);
    ctx.lineTo(x * s + 0.5, h * s);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * s + 0.5);
    ctx.lineTo(w * s, y * s + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

/* =========================
   UNIT SPRITES
========================= */

function drawUnits(ctx, units, sprites, camX, camY, tilesX, tilesY) {
  units.forEach(u => {
    const x = u.x - camX;
    const y = u.y - camY;
    if (x < 0 || y < 0 || x >= tilesX || y >= tilesY) return;

    const s = u.sprite;
    if (!s) return;

    ctx.drawImage(
      sprites,
      s.sx * TILE_SIZE,
      s.sy * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE,
      x * TILE_SIZE,
      y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  });
}


/* =========================
   COMPONENT
========================= */

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

  /* =========================
     CANVAS SIZE
  ========================= */

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    viewRef.current = getViewSize();
    canvas.width = viewRef.current.tilesX * TILE_SIZE;
    canvas.height = viewRef.current.tilesY * TILE_SIZE;
  };

  /* =========================
     SCALE
  ========================= */

  const updateScale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = Math.max(
      window.innerWidth / canvas.width,
      window.innerHeight / canvas.height
    );

    canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
    canvas.style.left = "50%";
    canvas.style.top = "50%";
    canvas.style.transformOrigin = "center";
  };

  /* =========================
     DRAW
  ========================= */

  const redraw = () => {
    if (!imagesLoadedRef.current) return;
    if (!mapRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { tilesX, tilesY } = viewRef.current;
    const cam = cameraRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tiles
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const mx = cam.x + x;
        const my = cam.y + y;
        if (mx < 0 || my < 0 || mx >= MAP_WIDTH || my >= MAP_HEIGHT) continue;

        const tile = TILES.find(t => t.id === mapRef.current[my][mx]);
        if (!tile) continue;

        ctx.drawImage(
          tilesetRef.current,
          tile.sx * TILE_SIZE,
          tile.sy * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }

    drawUnits(ctx, friendlyUnits, unitSpriteRef.current, cam.x, cam.y, tilesX, tilesY);
    drawUnits(ctx, enemyUnits, unitSpriteRef.current, cam.x, cam.y, tilesX, tilesY);

    // Selection square
if (selectedUnitRef.current) {
  const tileSquare = MOUSE_TILES.find(t => t.id === "tilesquare");
  drawOverlayTile(
    ctx,
    tileSquare,
    selectedUnitRef.current.x,
    selectedUnitRef.current.y,
    cam.x,
    cam.y
  );
}

// Cursor
const cursor = cursorRef.current;
const cursorSprite = MOUSE_TILES.find(t => t.id === "mousecursor");

drawOverlayTile(
  ctx,
  cursorSprite,
  cursor.x,
  cursor.y,
  cam.x,
  cam.y
);


    drawGrid(ctx, tilesX, tilesY, TILE_SIZE);
  };

  /* =========================
     LOAD MAP + IMAGES
  ========================= */

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
      updateScale();
      setTimeout(() => setPhase(PHASES.MAP_IDLE), 300);
    };

    tilesetRef.current.onload = onLoad;
    unitSpriteRef.current.onload = onLoad;
  }, [phase, setPhase]);

  /* =========================
     SPAWN UNITS
  ========================= */

  useEffect(() => {
    if (phase !== PHASES.MAP_IDLE) return;

    setTurn(TURN.PLAYER);

    setFriendlyUnits([
  createUnit({
    id: "p1",
    faction: FACTION.FRIENDLY,
    sprite: UNIT_SPRITES.FRIENDLY_SOLDIER,
    x: 8,
    y: 10
  }),
  createUnit({
    id: "p2",
    faction: FACTION.FRIENDLY,
    sprite: UNIT_SPRITES.FRIENDLY_ARCHER,
    x: 9,
    y: 10
  })
]);

setEnemyUnits([
  createUnit({
    id: "e1",
    faction: FACTION.ENEMY,
    sprite: UNIT_SPRITES.ENEMY_SOLDIER,
    x: 20,
    y: 10
  }),
  createUnit({
    id: "e2",
    faction: FACTION.ENEMY,
    sprite: UNIT_SPRITES.ENEMY_ARCHER,
    x: 22,
    y: 12
  })
]);
  }, [phase]);

    /* =========================
     Screen to tile Helper
  ========================= */

  function screenToTile(e, canvas, cam) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;

  return {
    x: Math.floor(px / TILE_SIZE) + cam.x,
    y: Math.floor(py / TILE_SIZE) + cam.y
  };
}

/* =========================
     draw helper
  ========================= */

function drawOverlayTile(ctx, sprite, x, y, camX, camY) {
  const sx = x - camX;
  const sy = y - camY;

  if (sx < 0 || sy < 0) return;

  ctx.drawImage(
    tilesetRef.current,
    sprite.sx * TILE_SIZE,
    sprite.sy * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    sx * TILE_SIZE,
    sy * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );
}


/* =========================
  Mouse handling
  ========================= */

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const onMove = e => {
    const tile = screenToTile(e, canvas, cameraRef.current);
    cursorRef.current = tile;
    redraw();
  };

  const onClick = e => {
    const tile = screenToTile(e, canvas, cameraRef.current);

    const unit = friendlyUnits.find(
      u => u.x === tile.x && u.y === tile.y
    );

    selectedUnitRef.current = unit || null;
    redraw();
  };

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("click", onClick);

  return () => {
    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("click", onClick);
  };
}, [friendlyUnits]);



  /* =========================
     REDRAW ON CHANGE
  ========================= */

  useEffect(() => {
    redraw();
  }, [friendlyUnits, enemyUnits]);

  /* =========================
     RESIZE
  ========================= */

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
