import { TILE_SIZE, TILES, MOUSE_TILES, WALK_ARROW_TILES } from "./wfc/tiles";

// Cache for loaded standalone unit images (keyed by src)
const unitImageCache = new Map();

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

    // Base shake offset when provided (e.g. hit animations)
    const baseOffset = (shakeOffsets && shakeOffsets.has(u.id)) ? shakeOffsets.get(u.id) : { dx: 0, dy: 0 };

    // Idle wiggle: small sinusoidal offset for units that are idle (haven't acted and not dead)
    let idleOffset = { dx: 0, dy: 0 };
    if (!u.isDead && !u.hasActed) {
      const now = performance.now() / 1000; // seconds
      // Create a stable per-unit seed from the id so units wiggle out of phase
      let seed = 0;
      const idStr = String(u.id || "");
      for (let i = 0; i < idStr.length; i++) seed = (seed * 31 + idStr.charCodeAt(i)) | 0;
      const phase = now * 3 + (seed % 100) * 0.02; // frequency and per-unit offset
      const ax = 0.7; // horizontal amplitude in pixels
      const ay = 1.0; // vertical amplitude in pixels
      idleOffset.dx = Math.sin(phase) * ax;
      idleOffset.dy = Math.sin(phase * 1.2) * ay * 0.6; // slightly different vertical timing
    }

    const offset = { dx: (baseOffset.dx || 0) + (idleOffset.dx || 0), dy: (baseOffset.dy || 0) + (idleOffset.dy || 0) };
    // Round final draw positions to integer pixels to avoid subpixel sampling
    // which causes pixel-art blurriness during smooth fractional movement.
    const drawX = Math.round(x * TILE_SIZE + offset.dx);
    const drawY = Math.round(y * TILE_SIZE + offset.dy);

    // Draw faction highlight behind unit (green for friendly, red for enemy)
    if (u.faction) {
      const isFriendly = u.faction === "friendly";
      ctx.save();
      ctx.fillStyle = isFriendly ? "rgba(50,220,100,0.12)" : "rgba(220,60,60,0.12)";
      ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = isFriendly ? "rgba(50,220,100,0.8)" : "rgba(220,60,60,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      ctx.restore();
    }

    // Support two sprite formats:
    // - tileset coords: { sx, sy } drawn from the `sprites` tilesheet
    // - standalone image: { src } drawn from a cached Image object
    if (u.sprite && u.sprite.src) {
      let img = unitImageCache.get(u.sprite.src);
      if (!img) {
        img = new Image();
        img.src = u.sprite.src;
        unitImageCache.set(u.sprite.src, img);
      }
      if (img.complete && img.naturalWidth > 0) {
        // Draw the image centered in the tile and scaled to fit
        ctx.drawImage(img, drawX, drawY, TILE_SIZE, TILE_SIZE);
      }
    } else {
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
    }

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

