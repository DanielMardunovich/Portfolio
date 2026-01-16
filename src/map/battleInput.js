import { TILE_SIZE } from "./wfc/tiles";

export function screenToTile(e, canvas, cam) {
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

export function attachBattleInput({
  canvas,
  cameraRef,
  cursorRef,
  selectedUnitRef,
  friendlyUnits,
  redraw
}) {
  const onMove = e => {
    cursorRef.current = screenToTile(e, canvas, cameraRef.current);
    redraw();
  };

  const onClick = e => {
    const tile = screenToTile(e, canvas, cameraRef.current);
    selectedUnitRef.current =
      friendlyUnits.find(u => u.x === tile.x && u.y === tile.y) || null;
    redraw();
  };

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("click", onClick);

  return () => {
    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("click", onClick);
  };
}


export function handleMouseMove(e, refs) {}
export function handleMouseClick(e, refs, friendlyUnits) {}
