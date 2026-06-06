"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const EPISODES: Record<string, { title: string; panels: { src?: string; label: string }[] }> = {
  "1": {
    title: "L'Éveil",
    panels: [
      { label: "Planche 1", src: "/planches/ch1-p1.png" },
      { label: "Planche 2", src: "/planches/ch1-p3.png" },
      { label: "Planche 3", src: "/planches/ch1-p2.png" },
    ],
  },
  "2": {
    title: "Les Portes de l'Ombre",
    panels: [
      { label: "Planche 1 — Le passage" },
      { label: "Planche 2 — L'adversaire" },
      { label: "Planche 3 — Combat" },
    ],
  },
  "3": {
    title: "Fragments de Mémoire",
    panels: [
      { label: "Planche 1 — Les flashbacks" },
      { label: "Planche 2 — La vérité" },
      { label: "Planche 3 — Épilogue" },
    ],
  },
};

function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div style={{
      width: "100%", minHeight: "420px",
      background: "#f0f0f0",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "12px",
    }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#bbb" strokeWidth="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="#bbb"/>
          <path d="M3 16l5-5 4 4 3-3 6 6" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{ fontSize: "12px", color: "#bbb", letterSpacing: "1px" }}>{label}</span>
    </div>
  );
}

export default function LecteurPage({ params }: { params: Promise<{ chapitre: string }> }) {
  const [chapitre, setChapitre] = useState("1");

  useEffect(() => {
    params.then((p) => setChapitre(p.chapitre));
  }, [params]);

  const ep = EPISODES[chapitre];
  const epNum = parseInt(chapitre);
  const total = Object.keys(EPISODES).length;

  if (!ep) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "20px", color: "#c0392b", marginBottom: "16px" }}>Épisode introuvable</p>
          <Link href="/" style={{ color: "#888", fontSize: "13px" }}>← Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reader-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 90;
          display: flex; align-items: center;
          padding: 0 20px; height: 50px;
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
          gap: 16px;
        }
        .reader-back-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #555; text-decoration: none;
          font-family: var(--font-rajdhani, sans-serif); font-weight: 600;
          letter-spacing: 0.5px; transition: color 0.2s;
          white-space: nowrap;
        }
        .reader-back-link:hover { color: #111; }
        .reader-back-link svg { flex-shrink: 0; }
        .reader-sep { color: #ddd; font-size: 16px; }
        .reader-ep-label {
          font-size: 13px; font-weight: 600; color: #222;
          font-family: var(--font-rajdhani, sans-serif);
          letter-spacing: 0.5px;
        }
        .reader-nav-btns { margin-left: auto; display: flex; gap: 8px; }
        .reader-nav-btn {
          font-size: 12px; font-weight: 700; letter-spacing: 1px;
          padding: 6px 14px; border: 1px solid #e0e0e0;
          background: #fff; color: #555; cursor: pointer;
          text-decoration: none; display: inline-flex; align-items: center;
          gap: 4px; border-radius: 4px; transition: all 0.2s;
          font-family: var(--font-rajdhani, sans-serif);
        }
        .reader-nav-btn:hover { border-color: #c0392b; color: #c0392b; }
        .reader-nav-btn.disabled { opacity: 0.3; pointer-events: none; }

        .reader-content {
          padding-top: 50px;
          background: #fff;
          min-height: 100vh;
        }
        .panels-wrap {
          max-width: 720px;
          margin: 0 auto;
          background: #fff;
        }
        .panel-item {
          width: 100%;
          display: block;
          line-height: 0;
        }
        .panel-item img {
          width: 100%; display: block;
        }

        /* Fin d'épisode */
        .ep-end {
          padding: 60px 24px 80px;
          text-align: center;
          background: #fff;
          border-top: 1px solid #f0f0f0;
        }
        .ep-end-line {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 32px; justify-content: center;
        }
        .ep-end-hr { flex: 1; max-width: 80px; height: 1px; background: #e0e0e0; }
        .ep-end-text {
          font-size: 12px; letter-spacing: 3px; color: #aaa;
          text-transform: uppercase;
          font-family: var(--font-rajdhani, sans-serif); font-weight: 600;
        }
        .ep-end-title {
          font-family: var(--font-bebas, 'Bebas Neue', sans-serif);
          font-size: 28px; letter-spacing: 4px; color: #222;
          margin-bottom: 8px;
        }
        .ep-end-sub { font-size: 13px; color: #aaa; margin-bottom: 32px; }
        .btn-next {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px;
          background: #c0392b; color: white; border: none;
          font-family: var(--font-rajdhani, sans-serif);
          font-size: 14px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer;
          text-decoration: none; border-radius: 4px;
          transition: all 0.3s; box-shadow: 0 4px 16px rgba(192,57,43,0.25);
        }
        .btn-next:hover { background: #e74c3c; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(192,57,43,0.35); }
        .btn-back-home {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px;
          background: transparent; color: #555;
          border: 1px solid #e0e0e0;
          font-family: var(--font-rajdhani, sans-serif);
          font-size: 14px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; cursor: pointer;
          text-decoration: none; border-radius: 4px;
          transition: all 0.3s;
        }
        .btn-back-home:hover { border-color: #c0392b; color: #c0392b; }

        /* Progress bar */
        .read-progress {
          position: fixed; top: 50px; left: 0; right: 0; height: 3px;
          background: #f0f0f0; z-index: 89;
        }
        .read-progress-fill {
          height: 100%; background: #c0392b;
          transition: width 0.1s linear;
        }

        @media (max-width: 600px) {
          .reader-ep-label { display: none; }
          .reader-sep { display: none; }
        }
      `}</style>

      <div className="reader-content">
        {/* Header */}
        <div className="reader-header">
          <Link className="reader-back-link" href={`/manga/primo-burst`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Liste des épisodes
          </Link>
          <span className="reader-sep">|</span>
          <span className="reader-ep-label">Épisode {epNum} — {ep.title}</span>
          <div className="reader-nav-btns">
            <Link href={`/lire/${epNum - 1}`} className={`reader-nav-btn ${epNum <= 1 ? "disabled" : ""}`}>
              ◀ Préc.
            </Link>
            <Link href={`/lire/${epNum + 1}`} className={`reader-nav-btn ${epNum >= total ? "disabled" : ""}`}>
              Suiv. ▶
            </Link>
          </div>
        </div>

        {/* Barre de progression */}
        <ProgressBar />

        {/* Panels */}
        <div className="panels-wrap">
          {ep.panels.map((panel, i) => (
            <div key={i} className="panel-item">
              {panel.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={panel.src} alt={panel.label} />
              ) : (
                <PlaceholderPanel label={panel.label} />
              )}
            </div>
          ))}

          {/* Fin d'épisode */}
          <div className="ep-end">
            <div className="ep-end-line">
              <div className="ep-end-hr" />
              <div className="ep-end-text">Fin de l'épisode</div>
              <div className="ep-end-hr" />
            </div>
            <div className="ep-end-title">Épisode {epNum} · {ep.title}</div>
            <div className="ep-end-sub">Merci d'avoir lu PRIMO BURST</div>
            {epNum < total ? (
              <Link className="btn-next" href={`/lire/${epNum + 1}`}>
                Épisode suivant ▶
              </Link>
            ) : (
              <Link className="btn-back-home" href="/manga/primo-burst">
                ← Retour à la liste
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="read-progress">
      <div className="read-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}
