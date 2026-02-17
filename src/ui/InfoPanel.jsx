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
  const [showCode, setShowCode] = useState(false);
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);
  const [activeCodeSamples, setActiveCodeSamples] = useState([]);
  const [loadedSamples, setLoadedSamples] = useState([]);

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

  // fetch code samples when activeCodeSamples change
  useEffect(() => {
    let mounted = true;
    if (!activeCodeSamples || activeCodeSamples.length === 0) {
      setLoadedSamples([]);
      return;
    }
    // initialize loadedSamples entries
    setLoadedSamples(activeCodeSamples.map((s) => ({ ...s, code: s.code || '' })));

    activeCodeSamples.forEach((s, idx) => {
      const url = s.url || s.src || s.path || s.filename;
      if (!url || s.code) return;
      // attempt to fetch
      fetch(url)
        .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.text(); })
        .then((text) => {
          if (!mounted) return;
          setLoadedSamples((prev) => {
            const copy = prev.slice();
            copy[idx] = { ...(copy[idx] || {}), ...s, code: text };
            return copy;
          });
        })
        .catch(() => {
          // leave as-is or mark error
          if (!mounted) return;
          setLoadedSamples((prev) => {
            const copy = prev.slice();
            copy[idx] = { ...(copy[idx] || {}), ...s, code: `// Unable to load ${url}` };
            return copy;
          });
        });
    });
    return () => { mounted = false; };
  }, [activeCodeSamples]);

  // highlight code blocks when shown/updated (uses highlight.js if available)
  useEffect(() => {
    if (!showCode) return;
    const t = setTimeout(() => {
      try {
        const el = panelRef.current && panelRef.current.querySelector('.code-pre code');
        if (el) {
          if (window.hljs && typeof window.hljs.highlightElement === 'function') {
            window.hljs.highlightElement(el);
          } else if (window.Prism && typeof window.Prism.highlightElement === 'function') {
            window.Prism.highlightElement(el);
          }
        }
      } catch (e) {
        // ignore
      }
    }, 0);
    return () => clearTimeout(t);
  }, [showCode, loadedSamples, activeCodeIndex]);

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
              <div className="hero-image hero-full">
                {heroSources.length > 0 ? (
                  <div className="slideshow">
                    <img className="slide-img" src={heroSources[heroIndex]} alt={`slide-${heroIndex}`} />
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
                <h2>Project Overview</h2>
                <p className="description-text">{data.description || data.text || "Description goes here."}</p>
              </div>
              <div className="right">
                <div className="project-details">
                  <h2>Project Details</h2>
                  <div className="details-list">
                    {(() => {
                      // Support two shapes for `data.details`:
                      // - Array of { label, value }
                      // - Object map { Label: value }
                      let entries = [];
                      if (Array.isArray(data.details)) {
                        entries = data.details.map((d, i) => [d.label || d.name || `Item ${i+1}`, d.value ?? d.text ?? d]);
                      } else {
                        const detailsObj = data.details || {
                          Category: data.category || "Group Project",
                          Date: data.date || "",
                          Duration: data.duration || "",
                          "Group Size": data.groupSize || data.group_size || "",
                          Position: data.position || data.role || "",
                          Languages: (data.languages && Array.isArray(data.languages)) ? data.languages.join(", ") : (data.language || ""),
                          Engine: data.engine || "",
                          "Other Technologies": data.otherTech || data.other || (data.technologies && data.technologies.join(", ")) || ""
                        };
                        entries = Object.entries(detailsObj);
                      }
                      return entries.map(([k, v]) => v ? (
                        <div className="detail-row" key={k}>
                          <div className="detail-label">{k}</div>
                          <div className="detail-value">{v}</div>
                        </div>
                      ) : null);
                    })()}
                  </div>
                  <div className="detail-buttons">
                    {data.codeUrl && (
                      <a className="btn code" href={data.codeUrl} target="_blank" rel="noopener noreferrer">View Codebase</a>
                    )}
                    {data.downloadUrl && (
                      <a className="btn download" href={data.downloadUrl} target="_blank" rel="noopener noreferrer">Download Game</a>
                    )}
                    { (data.itchUrl || data.itch) && (
                      <a className="btn itch" href={data.itchUrl || data.itch} target="_blank" rel="noopener noreferrer">Download on itch.io</a>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* AI IN ACTION (large GIF full width) */}
            <section className="media-full container">
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
              <h2>Featured Tech</h2>
              <div className="feature-row">
                {(data.features && data.features.length > 0) ? (
                  data.features.map((f, i) => (
                    <div className="feature-card" key={i}>
                      <h3>{f.title}</h3>
                      <p>{f.text}</p>
                      {/* Feature-level code button: accepts f.codeSamples (array) or f.code (string) */}
                      {((f.codeSamples && f.codeSamples.length) || f.code) && (
                        <div style={{ marginTop: 10 }}>
                          <button className="show-code-toggle" onClick={() => {
                            const samples = (f.codeSamples && f.codeSamples.length) ? f.codeSamples : (f.code ? [{ label: f.filename || f.label || `${f.title} code`, filename: f.filename, code: f.code, lang: f.lang || 'text' }] : []);
                            setActiveCodeSamples(samples);
                            setActiveCodeIndex(0);
                            setShowCode(true);
                          }}>Show Code</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  [1,2,3].map((n) => (
                    <div className="feature-card" key={n}><h3>Feature {n}</h3><p>Details about this feature.</p></div>
                  ))
                )}
              </div>

              <div className="technical-code">
                {showCode && (
                  <div className="code-panel">
                    {/* normalize code samples */}
                    {(() => {
                      const samples = (activeCodeSamples && activeCodeSamples.length)
                        ? activeCodeSamples
                        : (data.codeSamples && data.codeSamples.length) ? data.codeSamples : (data.code ? [{ label: data.codeFilename || 'Code', filename: data.codeFilename, code: data.code, lang: data.codeLang || 'text' }] : []);
                      if (!samples.length) return <div className="code-empty">No code samples provided.</div>;

                      const shown = loadedSamples.length === samples.length ? loadedSamples : samples.map((s) => ({ ...s, code: s.code || '' }));

                      return (
                        <>
                          <div className="code-tabs">
                            {samples.map((s, idx) => (
                              <button key={idx} className={`code-tab${idx === activeCodeIndex ? ' active' : ''}`} onClick={() => setActiveCodeIndex(idx)}>{s.label || s.filename || `File ${idx+1}`}</button>
                            ))}
                          </div>
                          <div className="code-content">
                            {(() => {
                              const s = shown[activeCodeIndex] || {};
                              const ext = (s.filename || '').split('.').pop() || '';
                              const lang = (s.lang || ext || 'text').toLowerCase();
                              return (
                                <pre className="code-pre"><code className={`language-${lang}`}>{s.code || ''}</code></pre>
                              );
                            })()}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
