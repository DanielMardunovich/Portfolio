import { useEffect, useRef, useState } from "react";
import "../styles/infoPanel.css";


// Portfolio InfoPanel: displays portfolio project info instead of unit stats
export default function InfoPanel({ project, isOpen, onClose }) {
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

  if (!project && !closing) return null;

  return (
    <>
      {(isOpen || closing) && <div className="info-panel-backdrop" onClick={handleClose}></div>}
      <div
        className={`info-panel${isOpen && !closing ? " open" : ""}${closing ? " closing" : ""}`}
        ref={panelRef}
      >
        <div className="info-panel-content">
          <div className="info-panel-header">
            <h2 className="info-panel-title">Portfolio Info</h2>
            <button className="info-panel-close" onClick={handleClose}>
              ✕
            </button>
          </div>
          <div className="info-panel-body">
            <div className="portfolio-main">
              <div className="portfolio-image">
                <div className="portfolio-image-box">
                  {project && project.image && <img src={project.image} alt={project.title} />}
                </div>
              </div>
              <div className="portfolio-details">
                <div className="portfolio-title">{project?.title || "Project Title"}</div>
                <div className="portfolio-description">{project?.description || "Project description goes here. Describe your work, technologies used, and your role."}</div>
                {project?.links && project.links.length > 0 && (
                  <div className="portfolio-links">
                    <span>Links: </span>
                    {project.links.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">{link.label || link.url}</a>
                    ))}
                  </div>
                )}
                {project?.highlights && project.highlights.length > 0 && (
                  <ul className="portfolio-highlights">
                    {project.highlights.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
