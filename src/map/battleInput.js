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
  friendlyUnitsRef,
  enemyUnitsRef,
  redraw,
  onUnitClick,
  onTileHover,
  onTileClick,
  moveMode
}) {
  // Always reads the latest unit arrays via refs — never stale
  const getUnits = () => ({
    friendly: friendlyUnitsRef.current,
    enemy: enemyUnitsRef.current
  });
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
    const { friendly, enemy } = getUnits();
    const friendlyUnit = friendly.find(u => u.x === tile.x && u.y === tile.y);
    const enemyUnit = enemy.find(u => u.x === tile.x && u.y === tile.y);
    const unit = friendlyUnit || enemyUnit;
    
    // If no unit was clicked, always notify tile click (used to clear selections
    // or to move when in moveMode).
    if (!unit) {
      if (onTileClick) onTileClick(tile);
      selectedUnitRef.current = null;
      redraw();
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
    // On touch start we only update cursor/hover state so fast drags still
    // behave responsively. Activation occurs on touchend to avoid interference
    // with gesture handling and to ensure a single tap opens the menu.
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const tile = screenToTile(touch, canvas, cameraRef.current);
      cursorRef.current = tile;
      if (onTileHover) onTileHover(tile);
      redraw();
    }
  };

  const onTouchEnd = e => {
    // Activation on touch end so a single tap opens menus reliably.
    e.preventDefault();
    const touch = (e.changedTouches && e.changedTouches[0]) || null;
    if (!touch) return;
    const tile = screenToTile(touch, canvas, cameraRef.current);
    const { friendly, enemy } = getUnits();
    const friendlyUnit = friendly.find(u => u.x === tile.x && u.y === tile.y);
    const enemyUnit = enemy.find(u => u.x === tile.x && u.y === tile.y);
    const unit = friendlyUnit || enemyUnit;

    cursorRef.current = tile;

    if (!unit) {
      if (onTileClick) onTileClick(tile);
      selectedUnitRef.current = null;
      redraw();
      return;
    }

    if (unit && onUnitClick) {
      onUnitClick(unit, touch.clientX, touch.clientY);
    }

    selectedUnitRef.current = unit || null;
    redraw();
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
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });

  return () => {
    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("click", onClick);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
  };
}