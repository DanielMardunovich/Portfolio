import { TILE_SIZE } from "./wfc/tiles";

export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 20;

export function getViewSize() {
  const tilesX = Math.ceil(window.innerWidth / TILE_SIZE);
  const tilesY = Math.ceil(window.innerHeight / TILE_SIZE);

  return {
    tilesX: Math.min(tilesX, MAP_WIDTH),
    tilesY: Math.min(tilesY, MAP_HEIGHT)
  };
}

export function getCenteredCamera() {
  const view = getViewSize();
  return {
    x: Math.max(0, Math.floor((MAP_WIDTH - view.tilesX) / 2)),
    y: Math.max(0, Math.floor((MAP_HEIGHT - view.tilesY) / 2))
  };
}
