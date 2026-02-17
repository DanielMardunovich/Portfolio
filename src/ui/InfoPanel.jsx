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

  // prefer project prop, otherwise use unit.meta.info when present
  const data = project || unit?.meta?.info || {};
  const [heroIndex, setHeroIndex] = useState(0);

  // build hero image sources priority: data.images -> unit.meta.images -> data.process images
  const heroSources = (data.images && data.images.length)
    ? data.images
    : (unit?.meta?.images && unit.meta.images.length)
      ? unit.meta.images
      : (data.process && data.process.length)
        ? data.process.map((p) => p.src || p.image)
        : [];

  // autoplay slideshow when panel is open and multiple images available
  useEffect(() => {
    if (!isOpen || heroSources.length <= 1) return undefined;
    setHeroIndex(0);
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSources.length);
    }, 4000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, heroSources.length]);

  // If no data and not closing, don't render
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
            <h2 className="info-panel-title">{data.name || project?.title || unit?.type || unit?.id || "Project"}</h2>
            <button className="info-panel-close" onClick={handleClose}>✕</button>
          </div>

          <div className="info-panel-body">
            {/* HERO SECTION */}
            <section className="hero container">
              <div className="hero-image">
                {heroSources.length > 0 ? (
                  <div className="slideshow">
                    <img className="slide-img" src={heroSources[heroIndex]} alt={`${data.name || project?.title} slide-${heroIndex}`} />
                    {heroSources.length > 1 && (
                      <>
                        <div className="slide-controls">
                          <button className="slide-btn prev" onClick={() => setHeroIndex((i) => (i - 1 + heroSources.length) % heroSources.length)}>&lt;</button>
                          <button className="slide-btn next" onClick={() => setHeroIndex((i) => (i + 1) % heroSources.length)}>&gt;</button>
                        </div>
                        <div className="slide-indicators">
                          {heroSources.map((_, idx) => (
                            <button key={idx} className={`indicator${idx === heroIndex ? " active" : ""}`} onClick={() => setHeroIndex(idx)} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="hero-placeholder">No image</div>
                )}
              </div>
              <div className="hero-content">
                <h1>{data.name || project?.title}</h1>
                {data.role && <div className="role-badge">{data.role}</div>}
              </div>
            </section>

            {/* ROLE SUMMARY STRIP */}
            {data.summary && (
              <div className="summary-strip">
                <p>{data.summary}</p>
              </div>
            )}

            {/* TWO-COLUMN SECTION */}
            <section className="two-column container">
              <div className="left">
                <h2>Description</h2>
                <p className="description-text">{data.description || data.text || "Description goes here."}</p>
              </div>
              <div className="right">
                <h2>Responsibilities</h2>
                <div className="responsibilities">
                  {(data.responsibilities && data.responsibilities.length > 0) ? (
                    data.responsibilities.map((r, i) => (
                      <div className="resp-card" key={i}><h3>{r.title || `Item ${i+1}`}</h3><p>{r.text || r}</p></div>
                    ))
                  ) : (
                    <div className="resp-card"><h3>AI Role</h3><p>Design and implement AI systems.</p></div>
                  )}
                </div>
              </div>
            </section>

            {/* AI IN ACTION (large GIF full width) */}
            <section className="media-full container">
              <h2>In Action</h2>
              {data.gif ? (
                <img src={data.gif} alt="demo" className="media-gif" />
              ) : (
                <div className="media-placeholder">No demo GIF</div>
              )}
            </section>

            {/* PROCESS / PLANNING (image grid with captions) */}
            <section className="process container">
              <h2>Process / Planning</h2>
              <div className="process-grid">
                {(data.process && data.process.length > 0) ? (
                  data.process.map((p, i) => (
                    <figure className="process-item" key={i}>
                      <img src={p.src || p.image} alt={p.caption || `process-${i}`} />
                      {p.caption && <figcaption>{p.caption}</figcaption>}
                    </figure>
                  ))
                ) : (
                  <div className="process-placeholder">No process images</div>
                )}
              </div>
            </section>

            {/* TECHNICAL BREAKDOWN (feature cards) */}
            <section className="technical container">
              <h2>Technical Breakdown</h2>
              <div className="feature-row">
                {(data.features && data.features.length > 0) ? (
                  data.features.map((f, i) => (
                    <div className="feature-card" key={i}><h3>{f.title}</h3><p>{f.text}</p></div>
                  ))
                ) : (
                  [1,2,3].map((n) => (
                    <div className="feature-card" key={n}><h3>Feature {n}</h3><p>Details about this feature.</p></div>
                  ))
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
