"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ── Types studio ──
type BubbleShape = "round" | "rect" | "explosion" | "thought" | "shout" | "narration" | "caption";
type PanelWidth = "full" | "wide" | "medium" | "small";
type PanelAlign = "left" | "center" | "right";

interface WebtoonPanel {
  id: string; image?: string; height: number;
  width: PanelWidth; align: PanelAlign;
  border?: boolean; borderSize?: number;
  split?: WebtoonPanel[];
}
interface Bubble {
  id: string; shape: BubbleShape; text: string;
  x: number; y: number; width: number; height: number;
  fontSize: number; color: string; bgColor: string;
  textAlign?: "left" | "center" | "right";
}
interface SFX {
  id: string; text: string; x: number; y: number;
  fontSize: number; color1: string; color2: string;
  strokeColor: string; rotation: number;
}
interface Block { type: string; data: WebtoonPanel | { id: string; color: string; height: number } }
interface StudioProject { blocks: Block[]; bubbles: Bubble[]; sfxList: SFX[]; titre: string }

function widthPct(w: PanelWidth) {
  return w === "full" ? "100%" : w === "wide" ? "85%" : w === "medium" ? "65%" : "45%";
}

function BubbleSVG({ shape, text, fontSize, color, bgColor, textAlign = "center" }: {
  shape: BubbleShape; text: string; fontSize: number;
  color: string; bgColor: string; textAlign?: "left" | "center" | "right";
}) {
  const dialogFont = "var(--font-oswald,'Oswald','Rajdhani',sans-serif)";
  const narrationFont = "var(--font-nunito,'Nunito',Georgia,serif)";
  const isNarration = shape === "narration" || shape === "caption";

  if (isNarration) {
    const isDark = bgColor === "#000000";
    const fid = `hd-r-${shape}`;
    return (
      <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="none">
          <defs>
            <filter id={fid} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>
          <rect x="3" y="4" width="100%" height="100%" rx="2" fill="rgba(0,0,0,0.15)"/>
          <rect x="0" y="0" width="100%" height="100%" rx="2" fill={bgColor}
            stroke={isDark ? "#fff" : "#111"} strokeWidth="2.5" filter={`url(#${fid})`}/>
        </svg>
        <div style={{ position: "relative", width: "100%", padding: "10px 16px", boxSizing: "border-box" }}>
          <span style={{ fontFamily: narrationFont, fontSize: `${fontSize}px`, fontWeight: 700, fontStyle: "italic", color: isDark ? "#fff" : "#111", textAlign, width: "100%", display: "block", letterSpacing: "0.3px", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</span>
        </div>
      </div>
    );
  }

  if (shape === "thought") return (
    <svg viewBox="0 0 200 145" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <filter id="th-rough-reader" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="3" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <g filter="url(#th-rough-reader)">
        <path d={`M 22,52 C 18,30 32,12 52,10 C 62,8 70,14 80,11 C 90,8 98,6 108,9 C 120,7 132,8 142,13 C 155,12 168,20 174,32 C 181,40 182,52 179,63 C 183,74 180,86 173,94 C 165,103 153,107 140,106 C 128,110 115,108 103,107 C 90,109 77,107 66,104 C 53,106 40,101 32,92 C 22,83 18,70 22,58 Z`} fill={bgColor} stroke="#111" strokeWidth="2.2" strokeLinejoin="round"/>
        <ellipse cx="75" cy="116" rx="9.5" ry="8" fill={bgColor} stroke="#111" strokeWidth="1.8"/>
        <ellipse cx="63" cy="127" rx="6" ry="5.5" fill={bgColor} stroke="#111" strokeWidth="1.5"/>
        <ellipse cx="53" cy="136" rx="3.8" ry="3.5" fill={bgColor} stroke="#111" strokeWidth="1.3"/>
      </g>
      <foreignObject x="24" y="16" width="152" height="82">
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: `'Nunito', sans-serif`, fontSize: `${Math.min(fontSize, 16)}px`, fontWeight: 500, color: color === "#000000" || color === "#111111" ? "#2a2a2a" : color, fontStyle: "italic", textAlign, width: "100%", lineHeight: 1.5, letterSpacing: "0.2px", wordBreak: "break-word", whiteSpace: "pre-wrap", padding: "0 6px" }}>{text}</span>
        </div>
      </foreignObject>
    </svg>
  );

  const fid2 = `fr-${shape}`;
  return (
    <svg viewBox="0 0 200 130" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <filter id={fid2}><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter>
      </defs>
      {shape === "round" && <>
        <ellipse cx="103" cy="57" rx="94" ry="43" fill="rgba(0,0,0,0.15)"/>
        <g filter={`url(#${fid2})`}><ellipse cx="100" cy="54" rx="94" ry="43" fill={bgColor} stroke="#111" strokeWidth="2.5"/></g>
        <path d="M 68,93 L 52,128 L 82,97 Z" fill={bgColor} stroke="#111" strokeWidth="2"/>
      </>}
      {shape === "rect" && <>
        <rect x="3" y="4" width="194" height="92" rx="4" fill="rgba(0,0,0,0.15)"/>
        <g filter={`url(#${fid2})`}><rect x="0" y="0" width="194" height="92" rx="4" fill={bgColor} stroke="#111" strokeWidth="2.5"/></g>
        <path d="M 68,89 L 52,128 L 82,93 Z" fill={bgColor} stroke="#111" strokeWidth="2"/>
      </>}
      {(shape === "shout" || shape === "explosion") && (
        <polygon points="100,5 120,35 155,20 145,55 185,50 165,75 190,95 155,90 160,125 130,105 120,130 100,108 80,130 70,105 40,125 45,90 10,95 35,75 15,50 55,55 45,20 80,35" fill={bgColor} stroke="#111" strokeWidth="2.5" filter={`url(#${fid2})`}/>
      )}
      <foreignObject x="10" y="8" width="180" height="80">
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: dialogFont, fontSize: `${Math.min(fontSize, 16)}px`, fontWeight: 700, color, textTransform: "uppercase", textAlign, width: "100%", lineHeight: 1.3, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{text}</span>
        </div>
      </foreignObject>
    </svg>
  );
}

function StudioReader({ project }: { project: StudioProject }) {
  const { blocks, bubbles, sfxList } = project;
  return (
    <div style={{ width: "100%", background: "#fff", position: "relative" }}>
      {blocks.map((block) => {
        if (block.type === "respiration") {
          const r = block.data as { id: string; color: string; height: number };
          return <div key={r.id} style={{ width: "100%", height: r.height, background: r.color }} />;
        }
        const p = block.data as WebtoonPanel;
        if (p.split) return (
          <div key={p.id} style={{ display: "flex", gap: "2px", width: "100%" }}>
            {p.split.map((sp: WebtoonPanel) => (
              <div key={sp.id} style={{ flex: 1, height: p.height, background: sp.image ? "transparent" : "#e8e8e8", border: sp.border ? `${sp.borderSize || 3}px solid #111` : "none", overflow: "hidden" }}>
                {sp.image && <img src={sp.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
              </div>
            ))}
          </div>
        );
        const w = widthPct(p.width);
        const m = p.align === "left" ? "0 auto 0 0" : p.align === "right" ? "0 0 0 auto" : "0 auto";
        return (
          <div key={p.id} style={{ width: w, margin: m, height: p.height, background: p.image ? "transparent" : "#e8e8e8", border: p.border ? `${p.borderSize || 3}px solid #111` : "none", overflow: "hidden", position: "relative" }}>
            {p.image && <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          </div>
        );
      })}
      {bubbles.map(bubble => (
        <div key={bubble.id} style={{ position: "absolute", left: bubble.x, top: bubble.y, width: bubble.width, height: bubble.height, pointerEvents: "none" }}>
          <BubbleSVG shape={bubble.shape} text={bubble.text} fontSize={bubble.fontSize} color={bubble.color} bgColor={bubble.bgColor} textAlign={bubble.textAlign ?? "center"} />
        </div>
      ))}
      {sfxList.map(sfx => {
        const gradId = `sfx-r-${sfx.id}`;
        return (
          <div key={sfx.id} style={{ position: "absolute", left: sfx.x, top: sfx.y, transform: `rotate(${sfx.rotation}deg)`, transformOrigin: "center", pointerEvents: "none" }}>
            <svg style={{ overflow: "visible" }} viewBox={`0 0 ${sfx.text.length * sfx.fontSize * 0.65} ${sfx.fontSize * 1.3}`} width={sfx.text.length * sfx.fontSize * 0.65} height={sfx.fontSize * 1.3}>
              <defs><linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={sfx.color1}/><stop offset="100%" stopColor={sfx.color2}/></linearGradient></defs>
              <text x="50%" y="85%" textAnchor="middle" fontFamily="var(--font-bangers,'Bangers',sans-serif)" fontSize={sfx.fontSize} stroke={sfx.strokeColor} strokeWidth="4" strokeLinejoin="round" paintOrder="stroke">{sfx.text}</text>
              <text x="50%" y="85%" textAnchor="middle" fontFamily="var(--font-bangers,'Bangers',sans-serif)" fontSize={sfx.fontSize} fill={`url(#${gradId})`}>{sfx.text}</text>
            </svg>
          </div>
        );
      })}
    </div>
  );
}

const EPISODES: Record<string, { title: string; panels: { src?: string; label: string }[] }> = {
  "1": { title: "L'Éveil", panels: [{ label: "Planche 1", src: "/planches/ch1-p1.png" }, { label: "Planche 2", src: "/planches/ch1-p3.png" }, { label: "Planche 3", src: "/planches/ch1-p2.png" }] },
  "2": { title: "Les Portes de l'Ombre", panels: [{ label: "Planche 1" }, { label: "Planche 2" }, { label: "Planche 3" }] },
  "3": { title: "Fragments de Mémoire", panels: [{ label: "Planche 1" }, { label: "Planche 2" }, { label: "Planche 3" }] },
};

function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div style={{ width: "100%", minHeight: "420px", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
      <span style={{ fontSize: "12px", color: "#bbb", letterSpacing: "1px" }}>{label}</span>
    </div>
  );
}

export default function LecteurPage({ params }: { params: Promise<{ chapitre: string }> }) {
  const [chapitre, setChapitre] = useState("1");
  const [studioProject, setStudioProject] = useState<StudioProject | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // ── Vérification auth — redirige si non connecté ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  useEffect(() => { params.then((p) => setChapitre(p.chapitre)); }, [params]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`manodream_episode_${chapitre}`);
      if (raw) setStudioProject(JSON.parse(raw));
      else setStudioProject(null);
    } catch { setStudioProject(null); }
  }, [chapitre]);

  // Écran de chargement pendant la vérif auth
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#06060a" }}>
      <div style={{ color: "#c0392b", fontSize: "18px", fontFamily: "sans-serif" }}>⏳ Vérification...</div>
    </div>
  );

  const ep = EPISODES[chapitre];
  const epNum = parseInt(chapitre);
  const total = Object.keys(EPISODES).length;
  const epTitle = studioProject?.titre || ep?.title || "Épisode";

  if (!ep && !studioProject) {
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
        .reader-header { position: fixed; top: 0; left: 0; right: 0; z-index: 90; display: flex; align-items: center; padding: 0 20px; height: 50px; background: #fff; border-bottom: 1px solid #e8e8e8; gap: 16px; }
        .reader-back-link { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; text-decoration: none; font-family: var(--font-rajdhani, sans-serif); font-weight: 600; letter-spacing: 0.5px; transition: color 0.2s; white-space: nowrap; }
        .reader-back-link:hover { color: #111; }
        .reader-sep { color: #ddd; font-size: 16px; }
        .reader-ep-label { font-size: 13px; font-weight: 600; color: #222; font-family: var(--font-rajdhani, sans-serif); letter-spacing: 0.5px; }
        .reader-nav-btns { margin-left: auto; display: flex; gap: 8px; }
        .reader-nav-btn { font-size: 12px; font-weight: 700; letter-spacing: 1px; padding: 6px 14px; border: 1px solid #e0e0e0; background: #fff; color: #555; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; border-radius: 4px; transition: all 0.2s; font-family: var(--font-rajdhani, sans-serif); }
        .reader-nav-btn:hover { border-color: #c0392b; color: #c0392b; }
        .reader-nav-btn.disabled { opacity: 0.3; pointer-events: none; }
        .reader-content { padding-top: 50px; background: #fff; min-height: 100vh; }
        .panels-wrap { width: 800px; max-width: 100%; margin: 0 auto; background: #fff; }
        .panel-item { width: 100%; display: block; line-height: 0; }
        .panel-item img { width: 100%; display: block; }
        .ep-end { padding: 60px 24px 80px; text-align: center; background: #fff; border-top: 1px solid #f0f0f0; }
        .ep-end-line { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; justify-content: center; }
        .ep-end-hr { flex: 1; max-width: 80px; height: 1px; background: #e0e0e0; }
        .ep-end-text { font-size: 12px; letter-spacing: 3px; color: #aaa; text-transform: uppercase; font-family: var(--font-rajdhani, sans-serif); font-weight: 600; }
        .ep-end-title { font-family: var(--font-bebas, 'Bebas Neue', sans-serif); font-size: 28px; letter-spacing: 4px; color: #222; margin-bottom: 8px; }
        .ep-end-sub { font-size: 13px; color: #aaa; margin-bottom: 32px; }
        .btn-next { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #c0392b; color: white; border: none; font-family: var(--font-rajdhani, sans-serif); font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; text-decoration: none; border-radius: 4px; transition: all 0.3s; box-shadow: 0 4px 16px rgba(192,57,43,0.25); }
        .btn-next:hover { background: #e74c3c; transform: translateY(-2px); }
        .btn-back-home { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: transparent; color: #555; border: 1px solid #e0e0e0; font-family: var(--font-rajdhani, sans-serif); font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; text-decoration: none; border-radius: 4px; transition: all 0.3s; }
        .btn-back-home:hover { border-color: #c0392b; color: #c0392b; }
        .read-progress { position: fixed; top: 50px; left: 0; right: 0; height: 3px; background: #f0f0f0; z-index: 89; }
        .read-progress-fill { height: 100%; background: #c0392b; transition: width 0.1s linear; }
        @media (max-width: 600px) { .reader-ep-label { display: none; } .reader-sep { display: none; } }
      `}</style>

      <div className="reader-content">
        <div className="reader-header">
          <Link className="reader-back-link" href="/manga/primo-burst">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Liste des épisodes
          </Link>
          <span className="reader-sep">|</span>
          <span className="reader-ep-label">Épisode {epNum} — {epTitle}</span>
          <div className="reader-nav-btns">
            <Link href={`/lire/${epNum - 1}`} className={`reader-nav-btn ${epNum <= 1 ? "disabled" : ""}`}>◀ Préc.</Link>
            <Link href={`/lire/${epNum + 1}`} className={`reader-nav-btn ${epNum >= total ? "disabled" : ""}`}>Suiv. ▶</Link>
          </div>
        </div>

        <ProgressBar />

        <div className="panels-wrap">
          {studioProject ? (
            <StudioReader project={studioProject} />
          ) : (
            ep?.panels.map((panel, i) => (
              <div key={i} className="panel-item">
                {panel.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={panel.src} alt={panel.label} />
                ) : (
                  <PlaceholderPanel label={panel.label} />
                )}
              </div>
            ))
          )}

          <div className="ep-end">
            <div className="ep-end-line"><div className="ep-end-hr" /><div className="ep-end-text">Fin de l'épisode</div><div className="ep-end-hr" /></div>
            <div className="ep-end-title">Épisode {epNum} · {epTitle}</div>
            <div className="ep-end-sub">Merci d'avoir lu PRIMO BURST</div>
            {epNum < total ? (
              <Link className="btn-next" href={`/lire/${epNum + 1}`}>Épisode suivant ▶</Link>
            ) : (
              <Link className="btn-back-home" href="/manga/primo-burst">← Retour à la liste</Link>
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
  return <div className="read-progress"><div className="read-progress-fill" style={{ width: `${progress}%` }} /></div>;
}
