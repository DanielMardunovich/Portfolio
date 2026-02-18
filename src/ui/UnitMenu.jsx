import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { FACTION } from "../game/units";
import "../styles/unitMenu.css";

export default function UnitMenu({ unit, position, onSelect, onClose }) {
  const menuRef = useRef(null);
  const [computedPos, setComputedPos] = useState({ left: position?.x ?? 0, top: position?.y ?? 0 });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleTouchOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleTouchOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, [onClose]);

  // Compute menu position after render so it doesn't overflow the viewport.
  useLayoutEffect(() => {
    if (!menuRef.current || !position) return;

    const compute = () => {
      const margin = 8;
      const menuRect = menuRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = position.x;
      let top = position.y;

      // If menu would overflow bottom, try to flip above the unit
      if (top + menuRect.height + margin > vh) {
        const aboveTop = position.y - menuRect.height - margin;
        if (aboveTop >= margin) {
          top = Math.max(margin, position.y - menuRect.height - 12);
        } else {
          // clamp so menu fits in viewport
          top = Math.max(margin, vh - menuRect.height - margin);
        }
      }

      // Ensure menu stays within vertical bounds
      top = Math.max(margin, Math.min(top, vh - menuRect.height - margin));

      // Ensure horizontal stays within viewport
      left = Math.max(margin, Math.min(left, vw - menuRect.width - margin));

      setComputedPos({ left, top });
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.x, position?.y, unit?.id]);

  if (!unit || !position) return null;

  const handleAction = (action) => {
    onSelect(action, unit);
    onClose();
  };

  const isEnemy = unit.faction === FACTION.ENEMY;

  return (
    <div
      ref={menuRef}
      className="unit-menu"
      style={{
        left: `${computedPos.left}px`,
        top: `${computedPos.top}px`
      }}
    >
      <div className="unit-menu-header">
        <div className="unit-menu-name">{unit.meta?.info?.name || unit.type || unit.id}</div>
        <div className="unit-menu-info-item">
          <span className="unit-info-label">HP</span>
          <span className="unit-info-value">{unit.hp}</span>
        </div>
        <div className="unit-menu-info-item">
          <span className="unit-info-label">ATK</span>
          <span className="unit-info-value">{unit.atk ?? unit.meta?.atk ?? "-"}</span>
        </div>
        <div className="unit-menu-info-item">
          <span className="unit-info-label">RNG</span>
          <span className="unit-info-value">{unit.range ?? unit.meta?.range ?? "-"}</span>
        </div>
        <div className="unit-menu-divider"></div>
      </div>
      
      {isEnemy ? (
        // Enemy unit options
        <>
          <button 
            className="unit-menu-option"
            onClick={() => handleAction("link")}
          >
            <span className="menu-icon">⛓</span>
            <span>Link</span>
          </button>
          <button 
            className="unit-menu-option"
            onClick={() => handleAction("info")}
          >
            <span className="menu-icon">ⓘ</span>
            <span>Info</span>
          </button>
        </>
      ) : (
        // Friendly unit options
        <>
          <button 
            className="unit-menu-option"
            onClick={() => handleAction("move")}
            disabled={unit.hasActed}
          >
            <span className="menu-icon">→</span>
            <span>Act</span>
          </button>
          <button 
            className="unit-menu-option"
            onClick={() => handleAction("wait")}
            disabled={unit.hasActed}
          >
            <span className="menu-icon">⏳</span>
            <span>Wait</span>
          </button>
          <button 
            className="unit-menu-option"
            onClick={() => handleAction("info")}
          >
            <span className="menu-icon">ⓘ</span>
            <span>Info</span>
          </button>
        </>
      )}
      
      <button 
        className="unit-menu-option unit-menu-cancel"
        onClick={onClose}
      >
        <span className="menu-icon">✕</span>
        <span>Cancel</span>
      </button>
    </div>
  );
}
