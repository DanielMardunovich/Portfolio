import { useEffect, useRef, useState } from "react";
import "../styles/infoPanel.css";


// Portfolio InfoPanel: displays portfolio project info instead of unit stats
export default function InfoPanel({ project, unit, isOpen, onClose }) {
  const panelRef = useRef(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) setClosing(false);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (isOpen && !closing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line
  }, [isOpen, closing]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 350); // match CSS transition
  };

  // If a unit is provided prefer it, otherwise fall back to project (portfolio)
  if (!project && !unit && !closing) return null;

  return (
    <>
      {(isOpen || closing) && <div className="info-panel-backdrop" onClick={handleClose}></div>}
      <div
        className={`info-panel${isOpen && !closing ? " open" : ""}${closing ? " closing" : ""}`}
        ref={panelRef}
      >
        <div className="info-panel-content">
            <div className="info-panel-header">
            <h2 className="info-panel-title">{unit ? (unit.meta?.info?.name || unit.type || unit.id) : "Portfolio Info"}</h2>
            <button className="info-panel-close" onClick={handleClose}>
              ✕
            </button>
          </div>
          <div className="info-panel-body">
            <div className="info-panel-main">
              <div className="info-panel-image">
                {unit ? (
                  // Render each image inside its own box stacked vertically
                  unit.meta?.images?.map((src, idx) => (
                    <div className="info-image-box" key={idx}>
                      <img src={src} alt={`${unit.id || unit.type}-img-${idx}`} />
                    </div>
                  ))
                ) : (
                  <div className="info-image-box">
                    {project && project.image && <img src={project.image} alt={project.title} />}
                  </div>
                )}
                {/* Unit name below images */}
                {/* unit name removed (headline shown in right column header) */}
              </div>
              <div className="info-panel-stats">
                {unit ? (
                  <div className="info-stats-section">
                    <div className="info-stats-header">{unit.meta?.info?.headline || "Description"}</div>
                    <div className="portfolio-description">{unit.meta?.info?.text || ""}</div>
                  </div>
                ) : (
                  <>
                    <div className="info-stats-section">
                      <div className="info-stats-header">{project?.title || "Project Title"}</div>
                      <div className="portfolio-description">{project?.description || "Project description goes here. Describe your work, technologies used, and your role."}</div>
                    </div>
                    {project?.links && project.links.length > 0 && (
                      <div className="info-stats-section">
                        <div className="info-stats-header">Links</div>
                        <div className="portfolio-links">
                          {project.links.map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">{link.label || link.url}</a>
                          ))}
                        </div>
                      </div>
                    )}
                    {project?.highlights && project.highlights.length > 0 && (
                      <div className="info-stats-section">
                        <div className="info-stats-header">Highlights</div>
                        <ul className="portfolio-highlights">
                          {project.highlights.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
