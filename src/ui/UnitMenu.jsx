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

    // Reusable helper to compute position next to a unit rect.
    const computeMenuPosition = (unitRect, menuRect, { offset = 16, offsetY = 8, margin = 8 } = {}) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // default: place to the right of the unit
      let left = Math.round(unitRect.right + offset);
      // vertically align near the unit top (small offset)
      let top = Math.round(unitRect.top + offsetY);

      // if overflows right, flip to left side of the unit
      if (left + menuRect.width + margin > vw) {
        const leftCandidate = Math.round(unitRect.left - offset - menuRect.width);
        if (leftCandidate >= margin) left = leftCandidate;
        else left = Math.max(margin, vw - menuRect.width - margin);
      }

      // if bottom overflows, clamp upward so menu stays visible
      if (top + menuRect.height + margin > vh) {
        top = Math.max(margin, vh - menuRect.height - margin);
      }

      // never allow negative coords
      left = Math.max(margin, left);
      top = Math.max(margin, top);

      return { left, top };
    };

    const compute = () => {
      const menuRect = menuRef.current.getBoundingClientRect();

      // Accept several shapes for `position`: DOMRect-like, {x,y}, or an element
      let unitRect = null;
      if (position && typeof position.left === 'number' && typeof position.top === 'number' && typeof position.width === 'number') {
        unitRect = position;
      } else if (position && typeof position.x === 'number' && typeof position.y === 'number') {
        const px = Math.round(position.x);
        const py = Math.round(position.y);
        unitRect = { left: px, top: py, right: px, bottom: py, width: 0, height: 0 };
      } else if (position && position.getBoundingClientRect && typeof position.getBoundingClientRect === 'function') {
        unitRect = position.getBoundingClientRect();
      } else if (unit && unit.element && unit.element.getBoundingClientRect) {
        // fallback if unit exposes a DOM element reference
        unitRect = unit.element.getBoundingClientRect();
      }

      if (!unitRect) unitRect = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

      const pos = computeMenuPosition(unitRect, menuRect, { offset: 16, offsetY: 8, margin: 8 });
      setComputedPos({ left: pos.left, top: pos.top });
    };

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, { passive: true });
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, unit?.id]);

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
      {/* Top full-width Project info bar (only when editorShowInfo is enabled) */}
      {unit.editorShowInfo !== false && (
        <button
          className="unit-menu-option unit-menu-project-top project-info"
          onClick={() => handleAction("info")}
        >
          <span className="menu-icon">ⓘ</span>
          <span>Project info</span>
        </button>
      )}

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
          {/* Show Link only when the unit provides links in metadata */}
          {unit.meta && (
            ((Array.isArray(unit.meta.links) && unit.meta.links.length > 0) ||
             (unit.meta.info && Array.isArray(unit.meta.info.links) && unit.meta.info.links.length > 0))
          ) && (
            <button 
              className="unit-menu-option"
              onClick={() => handleAction("link")}
            >
              <span className="menu-icon">⛓</span>
              <span>Link</span>
            </button>
          )}
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
