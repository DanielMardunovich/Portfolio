import { useEffect, useRef } from "react";
import { FACTION } from "../game/units";
import "../styles/unitMenu.css";

export default function UnitMenu({ unit, position, onSelect, onClose }) {
  const menuRef = useRef(null);

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
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="unit-menu-header">
        <div className="unit-menu-info-item">
          <span className="unit-info-label">HP</span>
          <span className="unit-info-value">{unit.hp}</span>
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
            <span>Move</span>
          </button>
          <button 
            className="unit-menu-option"
            onClick={() => handleAction("attack")}
            disabled={unit.hasActed}
          >
            <span className="menu-icon">⚔</span>
            <span>Attack</span>
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
