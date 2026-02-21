import React from "react";
import "../styles/unitMenu.css";

export default function ProjectsMenu({ projects, isOpen, onClose, onProjectClick }) {
  return (
    <div className={`projects-menu${isOpen ? " open" : ""}`}>  
      <div className="projects-menu-header">
        <span className="projects-menu-title">Projects</span>

      </div>
      <div className="projects-menu-list">
        {projects.map((proj, idx) => (
          <button
            key={proj.title + idx}
            className="unit-menu-project-top"
            onClick={() => onProjectClick(proj)}
          >
            {proj.image && (
              <img src={proj.image} alt="icon" style={{ width: 28, height: 28, marginRight: 10, borderRadius: 4 }} />
            )}
            <span style={{ fontWeight: "bold", color: "#fff8e7" }}>{proj.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}