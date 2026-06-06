"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const EPISODES: Record<string, { title: string; panels: { type: number; icon: string; label: string; src?: string }[] }> = {
  "1": {
    title: "L'Éveil du Rêveur",
    panels: [
      { type: 1, icon: "⚔", label: "Planche 1 — Ouverture", src: "/planches/ch1-p1.png" },
      { type: 3, icon: "💥", label: "Planche 2", src: "/planches/ch1-p3.png" },
      { type: 2, icon: "🌙", label: "Planche 3 — PRIMO BURST", src: "/planches/ch1-p2.png" },
    ],
  },
  "2": {
    title: "Les Portes de l'Ombre",
    panels: [
      { type: 2, icon: "🌑", label: "Planche 1 — Le passage" },
      { type: 3, icon: "⚔", label: "Planche 2 — L'adversaire" },
      { type: 1, icon: "💥", label: "Planche 3 — Combat" },
      { type: 4, icon: "🔥", label: "Planche 4 — Explosion de pouvoir" },
    ],
  },
  "3": {
    title: "Fragments de Mémoire",
    panels: [
      { type: 3, icon: "🌊", label: "Planche 1 — Les flashbacks" },
      { type: 1, icon: "👁", label: "Planche 2 — La vérité" },
      { type: 5, icon: "⚡", label: "Planche 3 — Nouvelle mission" },
      { type: 2, icon: "🌙", label: "Planche 4 — Épilogue" },
    ],
  },
};

const PANEL_STYLES: Record<number, string> = {
  1: "linear-gradient(160deg, #0d0508 0%, #12080e 40%, #080810 100%)",
  2: "linear-gradient(200deg, #080a12 0%, #0f0808 60%, #0a0a0a 100%)",
  3: "linear-gradient(140deg, #06080f 0%, #0e0608 50%, #0a0808 100%)",
  4: "linear-gradient(180deg, #0a0a14 0%, #0f0808 100%)",
  5: "linear-gradient(160deg, #0d0508 0%, #080812 100%)",
};

const PANEL_HEIGHTS: Record<number, string> = {
  1: "480px", 2: "360px", 3: "560px", 4: "400px", 5: "520px",
};

const PANEL_GLOW: Record<number, string> = {
  1: "radial-gradient(ellipse at 50% 30%, rgba(192,57,43,0.18) 0%, transparent 60%)",
  2: "radial-gradient(ellipse at 70% 50%, rgba(231,76,60,0.12) 0%, transparent 55%)",
  3: "radial-gradient(ellipse at 30% 60%, rgba(192,57,43,0.2) 0%, transparent 50%)",
  4: "radial-gradient(ellipse at 60% 40%, rgba(255,107,53,0.1) 0%, transparent 50%)",
  5: "radial-gradient(ellipse at 40% 50%, rgba(192,57,43,0.15) 0%, transparent 60%)",
};

function PanelPlaceholder({ icon, label, type, src }: { icon: string; label: string; type: number; src?: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={label} style={{ width: "100%", display: "block" }} />
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height: PANEL_HEIGHTS[type],
        background: PANEL_STYLES[type],
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        overflow: "hidden",
      }}
    >
      {/* glow */}
      <div style={{ position: "absolute", inset: 0, background: PANEL_GLOW[type] }} />
      {/* speed lines */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(192,57,43,0.03) 0.5deg, transparent 1deg)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, fontSize: "48px", opacity: 0.2 }}>{icon}</div>
      <div
        style={{
          position: "relative", zIndex: 1,
          fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
          fontSize: "11px", opacity: 0.4, letterSpacing: "4px", textTransform: "uppercase",
          color: "var(--light, #f0eff8)",
        }}
      >
        {label}
      </div>
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--void, #06060a)" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "24px", color: "var(--blood, #c0392b)", marginBottom: "16px" }}>Épisode introuvable</p>
          <Link href="/" style={{ color: "var(--ash, #8b8b9a)", fontSize: "13px" }}>← Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .reader-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 90;
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 14px;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(192,57,43,0.2);
          gap: 8px;
          height: 52px;
        }
        .reader-back {
          background: none; border: none; color: var(--ash);
          font-family: var(--font-rajdhani, 'Rajdhani', sans-serif);
          font-size: 13px; font-weight: 600; letter-spacing: 1.5px;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          text-transform: uppercase; transition: color 0.2s;
          text-decoration: none;
        }
        .reader-back:hover { color: var(--light); }
        .reader-ep-title {
          font-family: var(--font-bebas, 'Bebas Neue', sans-serif);
          font-size: 15px; letter-spacing: 2px; color: var(--light);
          flex: 1; text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .reader-nav { display: flex; gap: 8px; }
        .reader-nav a {
          border: 1px solid rgba(192,57,43,0.3); color: var(--ash);
          font-family: var(--font-rajdhani, 'Rajdhani', sans-serif);
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          padding: 5px 12px; cursor: pointer; text-transform: uppercase;
          transition: all 0.2s; text-decoration: none; display: inline-block;
          background: none;
        }
        .reader-nav a:hover { border-color: var(--blood); color: var(--light); }
        .reader-nav a.disabled { opacity: 0.3; pointer-events: none; }
        .episode-end {
          width: 100%; padding: 48px 24px; text-align: center;
          background: linear-gradient(to bottom, #000, #0a0608);
          border-top: 1px solid rgba(192,57,43,0.2);
        }
        .episode-end-title {
          font-family: var(--font-bebas, 'Bebas Neue', sans-serif);
          font-size: 28px; letter-spacing: 4px; color: var(--ash); margin-bottom: 20px;
        }
        .btn-primary {
          font-family: var(--font-rajdhani, 'Rajdhani', sans-serif);
          font-size: 14px; font-weight: 700; letter-spacing: 2.5px;
          text-transform: uppercase; padding: 12px 28px;
          background: var(--blood); color: white; border: none;
          cursor: pointer; transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          text-decoration: none; display: inline-block;
        }
        .btn-primary:hover { background: var(--fire); transform: translateY(-2px); }
        .btn-secondary {
          font-family: var(--font-rajdhani, 'Rajdhani', sans-serif);
          font-size: 14px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; padding: 12px 24px;
          background: transparent; color: var(--silver);
          border: 1px solid rgba(200,200,216,0.25);
          cursor: pointer; transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          text-decoration: none; display: inline-block;
        }
        .btn-secondary:hover { border-color: var(--blood); color: var(--light); }
      `}</style>

      <div style={{ background: "#000", minHeight: "100vh" }}>
        {/* Header */}
        <div className="reader-header">
          <Link className="reader-back" href="/">← Retour</Link>
          <div className="reader-ep-title">Ép. {epNum} — {ep.title}</div>
          <div className="reader-nav">
            <Link href={`/lire/${epNum - 1}`} className={epNum <= 1 ? "disabled" : ""}>◀ Préc.</Link>
            <Link href={`/lire/${epNum + 1}`} className={epNum >= total ? "disabled" : ""}>Suiv. ▶</Link>
          </div>
        </div>

        {/* Planches */}
        <div style={{ paddingTop: "52px", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "720px", margin: "0 auto", width: "100%" }}>
          {ep.panels.map((panel, i) => (
            <div key={i} style={{ width: "100%" }}>
              <PanelPlaceholder icon={panel.icon} label={panel.label} type={panel.type} src={panel.src} />
            </div>
          ))}

          {/* Fin d'épisode */}
          <div className="episode-end">
            <div className="episode-end-title">— Fin de l'épisode {epNum} —</div>
            {epNum < total ? (
              <Link className="btn-primary" href={`/lire/${epNum + 1}`}>Épisode suivant ▶</Link>
            ) : (
              <Link className="btn-secondary" href="/">← Retour à l'accueil</Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
