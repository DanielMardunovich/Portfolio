import { TILE_SIZE, TILES, MOUSE_TILES } from "./wfc/tiles";

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

export function drawMap(ctx, map, tileset, cam, view, mapW, mapH) {
  for (let y = 0; y < view.tilesY; y++) {
    for (let x = 0; x < view.tilesX; x++) {
      const mx = cam.x + x;
      const my = cam.y + y;
      if (mx < 0 || my < 0 || mx >= mapW || my >= mapH) continue;

      const tile = TILES.find(t => t.id === map[my][mx]);
      if (!tile) continue;

      ctx.drawImage(
        tileset,
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
}

export function drawUnits(ctx, units, sprites, cam, view) {
  units.forEach(u => {
    const x = u.x - cam.x;
    const y = u.y - cam.y;
    if (x < 0 || y < 0 || x >= view.tilesX || y >= view.tilesY) return;

    ctx.drawImage(
      sprites,
      u.sprite.sx * TILE_SIZE,
      u.sprite.sy * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE,
      x * TILE_SIZE,
      y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  });
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
