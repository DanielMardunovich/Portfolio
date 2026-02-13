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
  redraw,
  onUnitClick
}) {
  const onMove = e => {
    cursorRef.current = screenToTile(e, canvas, cameraRef.current);
    redraw();
  };

  const onClick = e => {
    const tile = screenToTile(e, canvas, cameraRef.current);
    const unit = friendlyUnits.find(u => u.x === tile.x && u.y === tile.y);
    
    if (unit && onUnitClick) {
      onUnitClick(unit, e.clientX, e.clientY);
    }
    
    selectedUnitRef.current = unit || null;
    redraw();
  };

  // Touch support for mobile
  const onTouchStart = e => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const tile = screenToTile(touch, canvas, cameraRef.current);
      const unit = friendlyUnits.find(u => u.x === tile.x && u.y === tile.y);
      
      cursorRef.current = tile;
      
      if (unit && onUnitClick) {
        onUnitClick(unit, touch.clientX, touch.clientY);
      }
      
      selectedUnitRef.current = unit || null;
      redraw();
    }
  };

  const onTouchMove = e => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      cursorRef.current = screenToTile(touch, canvas, cameraRef.current);
      redraw();
    }
  };

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });

  return () => {
    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("click", onClick);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
  };
}


export function handleMouseMove(e, refs) {}
export function handleMouseClick(e, refs, friendlyUnits) {}
