import { TILE_SIZE, TILES, MOUSE_TILES, WALK_ARROW_TILES } from "./wfc/tiles";

export function drawGrid(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  for (let x = 0; x <= w; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE + 0.5, 0);
    ctx.lineTo(x * TILE_SIZE + 0.5, h * TILE_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE + 0.5);
    ctx.lineTo(w * TILE_SIZE, y * TILE_SIZE + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawMap(ctx, map, tileset, cam, view, mapW, mapH, revealTimeMs = null, revealConfig = null) {
  const stagger = revealConfig?.staggerMs ?? 14;
  const dropDuration = revealConfig?.dropDurationMs ?? 260;
  const startYOffset = revealConfig?.startYOffset ?? -TILE_SIZE * 2;

  for (let x = 0; x < view.tilesX; x++) {
    for (let y = 0; y < view.tilesY; y++) {
      const mx = cam.x + x;
      const my = cam.y + y;
      if (mx < 0 || my < 0 || mx >= mapW || my >= mapH) continue;

      const tile = TILES.find(t => t.id === map[my][mx]);
      if (!tile) continue;

      let drawY = y * TILE_SIZE;
      if (revealTimeMs !== null) {
        // Reveal all tiles in column 0 at once, then column 1, etc.
        const delay = x * stagger;
        const localTime = revealTimeMs - delay;

        if (localTime < 0) {
          continue;
        }

        const t = Math.min(1, localTime / dropDuration);
        drawY = startYOffset + t * (y * TILE_SIZE - startYOffset);
      }

      ctx.drawImage(
        tileset,
        tile.sx * TILE_SIZE,
        tile.sy * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        x * TILE_SIZE,
        drawY,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

export function drawUnits(ctx, units, sprites, cam, view, hitMap = null, shakeOffsets = null) {
  units.forEach(u => {
    const x = u.x - cam.x;
    const y = u.y - cam.y;
    if (x < 0 || y < 0 || x >= view.tilesX || y >= view.tilesY) return;

    // Apply shake offset when provided
    const offset = (shakeOffsets && shakeOffsets.has(u.id)) ? shakeOffsets.get(u.id) : { dx: 0, dy: 0 };
    const drawX = x * TILE_SIZE + (offset.dx || 0);
    const drawY = y * TILE_SIZE + (offset.dy || 0);

    ctx.drawImage(
      sprites,
      u.sprite.sx * TILE_SIZE,
      u.sprite.sy * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE,
      drawX,
      drawY,
      TILE_SIZE,
      TILE_SIZE
    );

    // Draw hit flash overlay if present (opacity provided in hitMap)
    if (hitMap && hitMap.has(u.id)) {
      const opacity = hitMap.get(u.id) ?? 0.5;
      ctx.save();
      ctx.fillStyle = `rgba(255,0,0,${opacity})`;
      ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
      ctx.restore();
    }

    // If unit is dead, draw a semi-transparent gray overlay so it appears grayed out
    if (u.isDead) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
      ctx.restore();
    }
  });
}

export function drawDamageNumbers(ctx, damageNumbers, cam) {
  if (!damageNumbers || damageNumbers.length === 0) return;
  ctx.save();
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const d = damageNumbers[i];
    const now = performance.now();
    const elapsed = now - d.start;
    if (elapsed < 0) continue;
    const t = Math.min(1, elapsed / d.duration);
    const alpha = 1 - t;
    const rise = t * 20; // pixels to rise

    const sx = d.x - cam.x;
    const sy = d.y - cam.y;
    if (sx < -1 || sy < -1) continue;

    const px = sx * TILE_SIZE + TILE_SIZE / 2;
    const py = sy * TILE_SIZE - rise;

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeText(String(d.amount), px, py);
    ctx.fillText(String(d.amount), px, py);
  }
  ctx.restore();
}

export function drawOverlayTile(ctx, tileset, sprite, x, y, cam) {
  const sx = x - cam.x;
  const sy = y - cam.y;
  if (sx < 0 || sy < 0) return;

  ctx.drawImage(
    tileset,
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

export function drawCursor(ctx, tileset, cursor, cam) {
  const sprite = MOUSE_TILES.find(t => t.id === "mousecursor");
  drawOverlayTile(ctx, tileset, sprite, cursor.x, cursor.y, cam);
}

export function drawSelection(ctx, tileset, unit, cam) {
  const sprite = MOUSE_TILES.find(t => t.id === "tilesquare");
  drawOverlayTile(ctx, tileset, sprite, unit.x, unit.y, cam);
}

export function drawMovementRange(ctx, tileset, tiles, cam) {
  const sprite = MOUSE_TILES.find(t => t.id === "tilesquare");
  tiles.forEach(t => drawOverlayTile(ctx, tileset, sprite, t.x, t.y, cam));
}

export function drawColoredRange(ctx, tiles, cam, color = "rgba(255,0,0,0.45)") {
  if (!tiles || tiles.length === 0) return;
  ctx.save();
  ctx.fillStyle = color;
  tiles.forEach(t => {
    const sx = t.x - cam.x;
    const sy = t.y - cam.y;
    if (sx < 0 || sy < 0) return;
    ctx.fillRect(sx * TILE_SIZE, sy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  });
  ctx.restore();
}

export function drawPath(ctx, tileset, path, cam, getArrowTileFn) {
  if (!path || path.length <= 1) return;
  
  // Skip first tile (unit's current position) and draw arrows for the rest
  for (let i = 1; i < path.length; i++) {
    const arrowId = getArrowTileFn(path, i);
    if (!arrowId) continue;
    
    const sprite = WALK_ARROW_TILES.find(t => t.id === arrowId);
    if (!sprite) continue;
    
    drawOverlayTile(ctx, tileset, sprite, path[i].x, path[i].y, cam);
  }
}

