import { TILE_SIZE } from "./wfc/tiles";

export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 20;

// Viewport MUST be smaller than MAP_WIDTH/MAP_HEIGHT for camera scrolling to work.
// The canvas renders this many tiles, then CSS scale() stretches it to fill the screen.
// Scrollable range: 50-30=20 tiles horizontal, 40-22=18 tiles vertical
const VIEWPORT_TILES_X = 30;  // < MAP_WIDTH  (50)
const VIEWPORT_TILES_Y = 20;  // < MAP_HEIGHT (40)

export function getViewSize() {
  return {
    tilesX: VIEWPORT_TILES_X,
    tilesY: VIEWPORT_TILES_Y,
  };
}

export function getCenteredCamera() {
  const view = getViewSize();
  return {
    x: Math.max(0, Math.floor((MAP_WIDTH  - view.tilesX) / 2)),
    y: Math.max(0, Math.floor((MAP_HEIGHT - view.tilesY) / 2)),
  };
}