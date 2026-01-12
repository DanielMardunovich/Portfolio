import { useEffect, useRef } from "react";
import { useGame } from "../game/GameContext";
import { PHASES } from "../game/phases";
import { generateMap } from "./wfc";
import { TILE_SIZE, TILES } from "./tiles";
import "../styles/battleMap.css";

/* =========================
   WORLD CONFIG
========================= */

const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;

/* =========================
   VIEW SIZE (DYNAMIC)
========================= */

const getViewSize = (mapW, mapH) => {
  const tilesX = Math.ceil(window.innerWidth / TILE_SIZE);
  const tilesY = Math.ceil(window.innerHeight / TILE_SIZE);

  return {
    tilesX: Math.min(tilesX, mapW),
    tilesY: Math.min(tilesY, mapH),
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
   COMPONENT
========================= */

export default function BattleMap() {
  const { phase, setPhase } = useGame();

  const canvasRef = useRef(null);
  const tilesetRef = useRef(new Image());
  const mapRef = useRef(null);

  const cameraRef = useRef({ x: 0, y: 0 });
  const viewRef = useRef(getViewSize(MAP_WIDTH, MAP_HEIGHT));


  /* =========================
     SCALE (PIXEL PERFECT)
  ========================= */

const updateScale = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const scale = Math.max(
    window.innerWidth / canvas.width,
    window.innerHeight / canvas.height
  );

  canvas.style.left = "50%";
  canvas.style.top = "50%";
  canvas.style.transformOrigin = "center";
  canvas.style.transform = `
    translate(-50%, -50%)
    scale(${scale})
  `;
};



  /* =========================
     DRAW
  ========================= */

  const redraw = () => {
    const map = mapRef.current;
    if (!map) return;

    const { tilesX, tilesY } = viewRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cam = cameraRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const mx = cam.x + x;
        const my = cam.y + y;

        if (mx < 0 || my < 0 || mx >= MAP_WIDTH || my >= MAP_HEIGHT) continue;

        const tileId = map[my][mx];
        const tile = TILES.find(t => t.id === tileId);
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
    drawGrid(ctx, tilesX, tilesY, TILE_SIZE);
  };

  /* =========================
     GENERATE MAP
  ========================= */

  useEffect(() => {
    if (phase !== PHASES.MAP_INTRO) return;

    tilesetRef.current.src = "/Portfolio/TileMap/tilemap.png";

    tilesetRef.current.onload = () => {
      mapRef.current = generateMap(MAP_WIDTH, MAP_HEIGHT);

      console.log("Generated Map:", mapRef.current);

      redraw();
      updateScale();
      setTimeout(() => setPhase(PHASES.MAP_IDLE), 300);
    };
  }, [phase, setPhase]);

  /* =========================
     CAMERA MOVEMENT (KEYS)
  ========================= */

  useEffect(() => {
    const onKey = (e) => {
      if (phase !== PHASES.MAP_IDLE) return;

      const cam = cameraRef.current;
      const { tilesX, tilesY } = viewRef.current;

      if (e.key === "ArrowRight") cam.x++;
      if (e.key === "ArrowLeft") cam.x--;
      if (e.key === "ArrowDown") cam.y++;
      if (e.key === "ArrowUp") cam.y--;

        cam.x = Math.max(0, Math.min(cam.x, MAP_WIDTH - viewRef.current.tilesX));
        cam.y = Math.max(0, Math.min(cam.y, MAP_HEIGHT - viewRef.current.tilesY));

      redraw();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const onClick = (e) => {
    const rect = canvas.getBoundingClientRect();

    // Mouse position in canvas space (account for CSS scale)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    // Tile position in view
    const tileX = Math.floor(cx / TILE_SIZE);
    const tileY = Math.floor(cy / TILE_SIZE);

    const cam = cameraRef.current;

    // Tile position in map
    const mapX = cam.x + tileX;
    const mapY = cam.y + tileY;

    const map = mapRef.current;
    if (!map?.[mapY]?.[mapX]) return;

    const tileId = map[mapY][mapX];

    console.log("Clicked tile:", {
      tileId,
      mapX,
      mapY,
    });
  };

  canvas.addEventListener("click", onClick);
  return () => canvas.removeEventListener("click", onClick);
}, []);


  /* =========================
     RESIZE
  ========================= */

  useEffect(() => {
    const onResize = () => {
  viewRef.current = getViewSize(MAP_WIDTH, MAP_HEIGHT);

  const canvas = canvasRef.current;
  canvas.width = viewRef.current.tilesX * TILE_SIZE;
  canvas.height = viewRef.current.tilesY * TILE_SIZE;

  redraw();
  updateScale();
};


    window.addEventListener("resize", onResize);
    onResize();

    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* =========================
     RENDER
  ========================= */

  return (
    <canvas
      ref={canvasRef}
      className={`battle-map ${phase}`}
    />
  );
}
