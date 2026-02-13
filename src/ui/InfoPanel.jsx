import { useEffect, useRef } from "react";
import "../styles/infoPanel.css";

export default function InfoPanel({ unit, isOpen, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!unit) return null;

  return (
    <>
      {isOpen && <div className="info-panel-backdrop" onClick={onClose}></div>}
      <div className={`info-panel ${isOpen ? "open" : ""}`} ref={panelRef}>
        <div className="info-panel-content">
          <div className="info-panel-header">
            <h2 className="info-panel-title">{unit.name || "Unit Info"}</h2>
            <button className="info-panel-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="info-panel-body">
            <div className="info-stat-row">
              <span className="info-stat-label">HP</span>
              <span className="info-stat-value">{unit.hp}</span>
            </div>

            {unit.maxHp && (
              <div className="info-stat-row">
                <span className="info-stat-label">Max HP</span>
                <span className="info-stat-value">{unit.maxHp}</span>
              </div>
            )}

            {unit.attack !== undefined && (
              <div className="info-stat-row">
                <span className="info-stat-label">Attack</span>
                <span className="info-stat-value">{unit.attack}</span>
              </div>
            )}

            {unit.defense !== undefined && (
              <div className="info-stat-row">
                <span className="info-stat-label">Defense</span>
                <span className="info-stat-value">{unit.defense}</span>
              </div>
            )}

            {unit.speed !== undefined && (
              <div className="info-stat-row">
                <span className="info-stat-label">Speed</span>
                <span className="info-stat-value">{unit.speed}</span>
              </div>
            )}

            {unit.faction && (
              <div className="info-stat-row">
                <span className="info-stat-label">Faction</span>
                <span className="info-stat-value">{unit.faction}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
