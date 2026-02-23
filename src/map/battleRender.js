import { TILE_SIZE, TILES, MOUSE_TILES, WALK_ARROW_TILES } from "./wfc/tiles";

// Cache for loaded standalone unit images (keyed by src)
const unitImageCache = new Map();

// Small deterministic string -> numeric hash for per-unit phase variation
function hashStringToSeed(str) {
  if (!str) return 0;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

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

export function drawUnits(ctx, units, sprites, cam, view, hitMap = null, shakeOffsets = null, idlePulses = null) {
  const nowMs = performance.now();
  const nowSec = nowMs / 1000;

  // Prefer crisp nearest-neighbor sampling for pixel-art sprites
  if (ctx) ctx.imageSmoothingEnabled = false;

  units.forEach(u => {
    const x = u.x - cam.x;
    const y = u.y - cam.y;
    if (x < 0 || y < 0 || x >= view.tilesX || y >= view.tilesY) return;

    // Determine explicit shake offset (higher priority)
    let explicit = (shakeOffsets && shakeOffsets.has(u.id)) ? shakeOffsets.get(u.id) : null;

    // Compute draw position (apply explicit shake or deterministic idle wiggle below)
    // - tileset coords: { sx, sy } drawn from the `sprites` tilesheet
    // - standalone image: { src } drawn from a cached Image object
    // If an explicit shake exists, it overrides deterministic idle wiggle
    let drawX = x * TILE_SIZE;
    let drawY = y * TILE_SIZE;
    if (explicit) {
      drawX += (explicit.dx || 0);
      drawY += (explicit.dy || 0);
    } else {
      // deterministic idle wiggle
      const seed = hashStringToSeed(String(u.id || (u.x + ',' + u.y)));
      const phase = (seed % 1000) / 1000 * Math.PI * 2;
      const ampX = 2.4;
      const ampY = 1.8;
      const freqX = 1.4;
      const freqY = 1.0;
      let idleDx = Math.sin(nowSec * freqX + phase) * ampX;
      let idleDy = Math.cos(nowSec * freqY + phase * 1.3) * ampY;
      // Disable idle motion for moving, attacking, or dead units
      if (u.isMoving || u.isAttacking || u.isDead) { idleDx = 0; idleDy = 0; }

      // Apply an idle pulse multiplier when present (smooth envelope)
      if (idlePulses && idlePulses.has(u.id)) {
        const pulse = idlePulses.get(u.id);
        const remaining = Math.max(0, pulse.end - nowMs);
        const env = Math.min(1, remaining / pulse.duration);
        const mult = 1 + (pulse.strength || 0) * env;
        idleDx *= mult;
        idleDy *= mult;
      }

      drawX += idleDx;
      drawY += idleDy;
    }

    // Round to integer pixel positions to avoid subpixel sampling artifacts
    const rX = Math.round(drawX);
    const rY = Math.round(drawY);

    // Draw faction highlight behind unit (green for friendly, red for enemy)
    if (u.faction) {
      const isFriendly = u.faction === "friendly";
      ctx.save();
      ctx.fillStyle = isFriendly ? "rgba(50,220,100,0.12)" : "rgba(220,60,60,0.12)";
      ctx.fillRect(rX, rY, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = isFriendly ? "rgba(50,220,100,0.8)" : "rgba(220,60,60,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(rX + 1, rY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
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
        // Draw the image centered in the tile and scaled to fit (rounded coords)
        ctx.drawImage(img, rX, rY, TILE_SIZE, TILE_SIZE);
      }
    } else {
      ctx.drawImage(
        sprites,
        u.sprite.sx * TILE_SIZE,
        u.sprite.sy * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        rX,
        rY,
        TILE_SIZE,
        TILE_SIZE
      );
    }

    // Draw hit flash overlay if present (opacity provided in hitMap)
    if (hitMap && hitMap.has(u.id)) {
      const opacity = hitMap.get(u.id) ?? 0.5;
      ctx.save();
      ctx.fillStyle = `rgba(255,0,0,${opacity})`;
      ctx.fillRect(rX, rY, TILE_SIZE, TILE_SIZE);
      ctx.restore();
    }

    // If unit is dead, draw a semi-transparent gray overlay so it appears grayed out
    if (u.isDead) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(rX, rY, TILE_SIZE, TILE_SIZE);
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

