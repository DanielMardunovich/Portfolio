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
  enemyUnits,
  redraw,
  onUnitClick,
  onTileHover,
  onTileClick,
  moveMode
}) {
  const onMove = e => {
    const tile = screenToTile(e, canvas, cameraRef.current);
    cursorRef.current = tile;
    
    if (onTileHover) {
      onTileHover(tile);
    }
    
    redraw();
  };

  const onClick = e => {
    const tile = screenToTile(e, canvas, cameraRef.current);
    const friendlyUnit = friendlyUnits.find(u => u.x === tile.x && u.y === tile.y);
    const enemyUnit = enemyUnits.find(u => u.x === tile.x && u.y === tile.y);
    const unit = friendlyUnit || enemyUnit;
    
    // In move mode, clicking a tile moves the unit
    if (moveMode && !unit) {
      if (onTileClick) {
        onTileClick(tile);
      }
      return;
    }
    
    // Otherwise, handle unit clicks
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
      const friendlyUnit = friendlyUnits.find(u => u.x === tile.x && u.y === tile.y);
      const enemyUnit = enemyUnits.find(u => u.x === tile.x && u.y === tile.y);
      const unit = friendlyUnit || enemyUnit;
      
      cursorRef.current = tile;
      
      // In move mode, tapping a tile moves the unit
      if (moveMode && !unit) {
        if (onTileClick) {
          onTileClick(tile);
        }
        return;
      }
      
      // Otherwise, handle unit clicks
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
      const tile = screenToTile(touch, canvas, cameraRef.current);
      cursorRef.current = tile;
      
      if (onTileHover) {
        onTileHover(tile);
      }
      
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
