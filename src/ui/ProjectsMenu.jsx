import React from "react";
import "../styles/projectsMenu.css";

export default function ProjectsMenu({ projects = [], isOpen, onClose, onProjectClick, profile, contacts, onProfileClick }) {
  const prof = profile || { name: "Daniel Mardunovich", title: "Gameplay Engineer", image: "Me/PfP.jpg" };
  const contactList = contacts || [
    { label: "Resume Swedish", href: "Me/CVDanielMardunovich.pdf", image: "Icons/PDFPixel.png" },
    { label: "Resume English", href: "Me/ENGCVDanielMardunovich.pdf", image: "Icons/PDFPixel.png" },
    { label: "GitHub", href: "https://github.com/DanielMardunovich", image: "Icons/githubpixel.png" },
    { label: "mardunovich@gmail.com", href: "mailto:mardunovich@gmail.com", image: "Icons/GmailPixel.png" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-mardunovich", image: "Icons/linkedinpixel.png" },
  ];

  const initials = (prof.name || "").split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className={`projects-menu${isOpen ? " open" : ""}`}>
      <button
        type="button"
        className="projects-profile projects-profile-btn"
        onClick={() => onProfileClick ? onProfileClick(prof) : null}
        aria-label={`Open ${prof.name} info`}
      >
        {prof.image ? (
          <img src={prof.image} alt="profile" className="projects-profile-image" />
        ) : (
          <div className="projects-profile-initials">{initials}</div>
        )}
        <div className="projects-profile-text">
          <div className="projects-profile-name">{prof.name}</div>
          <div className="projects-profile-title">{prof.title}</div>
        </div>
      </button>

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
              <img src={proj.image} alt="icon" style={{ width: 32, height: 32, marginRight: 10, borderRadius: 4 }} />
            )}
            <span>{proj.title}</span>
          </button>
        ))}
      </div>

      <div className="projects-section-header">Contact</div>
      <div className="projects-contact-list">
        {contactList.map((c, i) => (
          <a key={c.label + i} className="contact-item" href={c.href} target="_blank" rel="noreferrer">
            <img src={c.image || "BulletDanceImages/logo.png"} alt={c.label} style={{ width:28, height:28, marginRight: 10, borderRadius:4 }} />
            <span>{c.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}