"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";

// ── GESTION PROJETS (localStorage) ──
interface Project {
  id: string;
  titre: string;
  blocks: Block[];
  bubbles: Bubble[];
  sfxList: SFX[];
  savedAt: string;
  thumb?: string; // miniature base64
}

// ── TYPES ──
type BubbleShape = "round" | "rect" | "explosion" | "thought" | "shout" | "narration" | "caption";

type PanelWidth = "full" | "wide" | "medium" | "small";   // % de la largeur du canvas
type PanelAlign = "left" | "center" | "right";

interface WebtoonPanel {
  id: string;
  image?: string;
  height: number;       // px
  width: PanelWidth;
  align: PanelAlign;
  border?: boolean;     // bordure noire manga (legacy)
  borderSize?: number;  // épaisseur px
  borderTop?: boolean; borderBottom?: boolean; borderLeft?: boolean; borderRight?: boolean;
  split?: WebtoonPanel[];
}

interface Respiration {
  id: string;
  color: string;
  height: number;
}

interface Bubble {
  id: string;
  shape: BubbleShape;
  text: string;
  x: number; y: number;
  width: number; height: number;
  fontSize: number;
  color: string;
  bgColor: string;
  textAlign?: "left" | "center" | "right";
}

// SFX = onomatopée style webtoon (BAM, BOUM, TCHAC...)
interface SFX {
  id: string;
  text: string;
  x: number; y: number;
  fontSize: number;
  color1: string;   // couleur principale (ex: orange)
  color2: string;   // couleur secondaire dégradé (ex: rouge)
  strokeColor: string; // contour (ex: blanc ou noir)
  rotation: number; // degrés
}

type Block =
  | { type: "panel"; data: WebtoonPanel }
  | { type: "respiration"; data: Respiration };

// ── CONSTANTES ──
const PANEL_HEIGHTS = [
  { label: "Bandeau", h: 180, icon: "━" },
  { label: "Moyen", h: 320, icon: "▬" },
  { label: "Grand", h: 480, icon: "▮" },
  { label: "Pleine page", h: 680, icon: "⬛" },
  { label: "Cinéma ×1.5", h: 960, icon: "🎬" },
  { label: "Épique ×2", h: 1280, icon: "🌟" },
];

const PANEL_WIDTHS: { label: string; val: PanelWidth; pct: string }[] = [
  { label: "Pleine", val: "full", pct: "100%" },
  { label: "Large", val: "wide", pct: "88%" },
  { label: "Moyen", val: "medium", pct: "72%" },
  { label: "Petite", val: "small", pct: "54%" },
];

const PANEL_ALIGNS: { label: string; val: PanelAlign; icon: string }[] = [
  { label: "Gauche", val: "left", icon: "⇤" },
  { label: "Centre", val: "center", icon: "⇔" },
  { label: "Droite", val: "right", icon: "⇥" },
];

const RESP_COLORS = [
  { label: "Blanc", color: "#ffffff" },
  { label: "Noir", color: "#000000" },
  { label: "Rouge", color: "#c0392b" },
  { label: "Bleu nuit", color: "#0a0f1f" },
  { label: "Gris", color: "#888888" },
];

const SFX_PRESETS = [
  { label: "BAM", color1: "#ff8c00", color2: "#ff2200", stroke: "#ffffff" },
  { label: "BOUM", color1: "#ffcc00", color2: "#ff6600", stroke: "#000000" },
  { label: "TCHAC", color1: "#ff4400", color2: "#aa0000", stroke: "#ffffff" },
  { label: "WHOOSH", color1: "#0088ff", color2: "#004499", stroke: "#ffffff" },
  { label: "CRASH", color1: "#ffffff", color2: "#aaaaaa", stroke: "#000000" },
  { label: "ZAP", color1: "#ffff00", color2: "#ff8800", stroke: "#222222" },
];

const BUBBLE_SHAPES: { shape: BubbleShape; label: string; icon: string }[] = [
  { shape: "round", label: "Ronde", icon: "💬" },
  { shape: "rect", label: "Rectangle", icon: "🗨️" },
  { shape: "explosion", label: "Explosive", icon: "💥" },
  { shape: "thought", label: "Pensée", icon: "💭" },
  { shape: "shout", label: "Cri", icon: "📢" },
  { shape: "narration", label: "Narration", icon: "📋" },
  { shape: "caption", label: "Caption", icon: "🎬" },
];

const uid = () => Math.random().toString(36).slice(2, 8);

const widthPct = (w: PanelWidth) => {
  if (w === "full") return "100%";
  if (w === "wide") return "88%";
  if (w === "medium") return "72%";
  return "54%";
};

// ── BOÎTE MAIN LEVÉE (narration / caption) ──
function HandDrawnBox({ bgColor, textColor, text, fontSize, align, bold, mangaFont }: {
  bgColor: string; textColor: string; text: string;
  fontSize: number; align: "left" | "center" | "right"; bold: boolean; mangaFont: string;
}) {
  // Filtre SVG qui simule un trait de stylo/pinceau légèrement irrégulier
  const filterId = `hd-${Math.random().toString(36).slice(2, 6)}`;
  const isDark = bgColor === "#000000";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Fond + bordure SVG avec effet main levée — s'étire sur toute la div */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
        <rect x="3" y="4" width="100%" height="100%" rx="2" fill="rgba(0,0,0,0.15)" />
        <rect x="0" y="0" width="100%" height="100%" rx="2"
          fill={bgColor}
          stroke={isDark ? "#ffffff" : "#111111"}
          strokeWidth={isDark ? "2" : "2.5"}
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* Texte centré par-dessus */}
      <div style={{
        position: "relative",
        width: "100%",
        padding: "10px 16px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
      }}>
        <span style={{
          fontFamily: "var(--font-nunito, 'Nunito', 'Georgia', serif)",
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          fontStyle: "italic",
          color: textColor,
          textTransform: "none",
          letterSpacing: "0.3px",
          lineHeight: 1.5,
          textAlign: align,
          width: "100%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          textShadow: isDark ? "none" : "0 1px 0 rgba(0,0,0,0.06)",
        }}>{text}</span>
      </div>
    </div>
  );
}

// ── SVG BULLES ──
function BubbleSVG({ shape, text, fontSize, color, bgColor, textAlign = "center" }: { shape: BubbleShape; text: string; fontSize: number; color: string; bgColor: string; textAlign?: "left" | "center" | "right" }) {
  const stroke = "#111111";
  const dialogFont = "var(--font-oswald, 'Oswald', 'Rajdhani', sans-serif)";
  const mangaFont = "var(--font-bangers, 'Bangers', 'Bebas Neue', sans-serif)";

  // ID unique pour les filtres SVG
  const fid = `f${Math.random().toString(36).slice(2,7)}`;
  const sid = `s${Math.random().toString(36).slice(2,7)}`;

  // Filtre commun : légère irrégularité + ombre douce
  const filters = (
    <defs>
      <filter id={fid} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id={sid} x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.22)" floodOpacity="1"/>
      </filter>
    </defs>
  );

  // 📋 NARRATION / 🎬 CAPTION — style main levée, police planche originale
  if (shape === "narration") return (
    <HandDrawnBox bgColor={bgColor === "#000000" ? "#000000" : "#ffffff"}
      textColor={bgColor === "#000000" ? "#ffffff" : "#111111"}
      text={text} fontSize={fontSize + 2} align={textAlign} bold={true} mangaFont={dialogFont} />
  );
  if (shape === "caption") return (
    <HandDrawnBox bgColor={bgColor === "#000000" ? "#000000" : "#ffffff"}
      textColor={bgColor === "#000000" ? "#ffffff" : "#111111"}
      text={text} fontSize={fontSize + 4} align={textAlign} bold={true} mangaFont={dialogFont} />
  );

  // 💬 RONDE — style Solo Leveling : ellipse propre, queue fine et sharp
  if (shape === "round") return (
    <svg viewBox="0 0 200 130" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {filters}
      {/* Ombre portée */}
      <ellipse cx="103" cy="57" rx="94" ry="43" fill="rgba(0,0,0,0.18)" filter={`url(#${sid})`}/>
      {/* Corps bulle */}
      <g filter={`url(#${fid})`}>
        <ellipse cx="100" cy="54" rx="94" ry="43" fill={bgColor} stroke={stroke} strokeWidth="2.5"/>
        {/* Queue fine et sharp style Solo Leveling — pointe vers le bas gauche */}
        <path d="M 68,93 L 52,128 L 82,97 Z" fill={bgColor} stroke={stroke} strokeWidth="2" strokeLinejoin="round"/>
      </g>
      {/* Texte — Nunito bold, légèrement fondu */}
      <foreignObject x="12" y="10" width="176" height="84">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: dialogFont, fontSize: `${fontSize}px`, fontWeight: 800,
          color: "#111", textAlign: "center", lineHeight: 1.25,
          letterSpacing: "0.2px",
          textRendering: "optimizeLegibility",
        }}>{text}</div>
      </foreignObject>
    </svg>
  );

  // 🗨️ RECTANGLE — queue sharp Solo Leveling
  if (shape === "rect") return (
    <svg viewBox="0 0 200 130" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {filters}
      <g filter={`url(#${sid})`}>
        <rect x="4" y="4" width="192" height="86" rx="5" fill="rgba(0,0,0,0.16)"/>
      </g>
      <g filter={`url(#${fid})`}>
        <rect x="3" y="3" width="192" height="85" rx="5" fill={bgColor} stroke={stroke} strokeWidth="2.5"/>
        {/* Queue fine pointue vers le bas */}
        <path d="M 72,88 L 58,128 L 88,90 Z" fill={bgColor} stroke={stroke} strokeWidth="2" strokeLinejoin="round"/>
      </g>
      <foreignObject x="12" y="8" width="176" height="74">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: dialogFont, fontSize: `${fontSize}px`, fontWeight: 800,
          color: "#111", textAlign: "center", lineHeight: 1.25,
          letterSpacing: "0.2px",
        }}>{text}</div>
      </foreignObject>
    </svg>
  );

  // 💥 EXPLOSION — starburst avec pointes irrégulières
  if (shape === "explosion") return (
    <svg viewBox="0 0 200 145" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {filters}
      <g filter={`url(#${sid})`}>
        <polygon points="100,3 122,35 162,12 148,50 198,50 164,78 190,118 142,102 134,142 100,106 66,142 58,102 10,118 36,78 2,50 52,50 38,12 78,35" fill="rgba(0,0,0,0.15)"/>
      </g>
      <g filter={`url(#${fid})`}>
        <polygon points="100,3 122,35 162,12 148,50 198,50 164,78 190,118 142,102 134,142 100,106 66,142 58,102 10,118 36,78 2,50 52,50 38,12 78,35"
          fill={bgColor} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round"/>
      </g>
      <foreignObject x="28" y="32" width="144" height="82">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: mangaFont, fontSize: `${fontSize}px`, fontWeight: 900,
          color: "#111", textAlign: "center", lineHeight: 1.2,
          letterSpacing: "1px",
        }}>{text}</div>
      </foreignObject>
    </svg>
  );

  // 💭 PENSÉE — pointillés, queue en bulles
  if (shape === "thought") return (
    <svg viewBox="0 0 200 138" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {filters}
      <g filter={`url(#${fid})`}>
        <ellipse cx="100" cy="54" rx="90" ry="42" fill={bgColor} stroke={stroke} strokeWidth="2" strokeDasharray="5,3"/>
        <circle cx="72" cy="104" r="10" fill={bgColor} stroke={stroke} strokeWidth="2"/>
        <circle cx="57" cy="119" r="6" fill={bgColor} stroke={stroke} strokeWidth="2"/>
        <circle cx="46" cy="130" r="4" fill={bgColor} stroke={stroke} strokeWidth="2"/>
      </g>
      <foreignObject x="14" y="14" width="172" height="78">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: dialogFont, fontSize: `${fontSize}px`, fontWeight: 600,
          color: "#333", textAlign: "center", lineHeight: 1.3,
          fontStyle: "italic",
        }}>{text}</div>
      </foreignObject>
    </svg>
  );

  // 📢 CRI
  return (
    <svg viewBox="0 0 200 128" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      {filters}
      <g filter={`url(#${sid})`}>
        <rect x="5" y="5" width="190" height="82" rx="1" fill="rgba(0,0,0,0.15)"/>
      </g>
      <g filter={`url(#${fid})`}>
        <rect x="3" y="3" width="190" height="80" rx="1" fill={bgColor} stroke={stroke} strokeWidth="3.5"/>
        <line x1="3" y1="3" x2="193" y2="83" stroke={stroke} strokeWidth="1" opacity="0.12"/>
        <line x1="193" y1="3" x2="3" y2="83" stroke={stroke} strokeWidth="1" opacity="0.12"/>
        {/* Queue sharp vers le bas */}
        <path d="M 82,83 L 70,120 L 100,85 Z" fill={bgColor} stroke={stroke} strokeWidth="2" strokeLinejoin="round"/>
      </g>
      <foreignObject x="10" y="8" width="180" height="68">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: mangaFont, fontSize: `${fontSize + 2}px`, fontWeight: 900,
          color: "#111", textAlign: "center", lineHeight: 1.2,
          letterSpacing: "2px", textTransform: "uppercase",
        }}>{text}</div>
      </foreignObject>
    </svg>
  );
}

// ── PANEL COMPOSANT ──
function PanelComp({ panel, selected, onClick, onImageDrop, onDelete, onEdit }: {
  panel: WebtoonPanel;
  selected: boolean;
  onClick: () => void;
  onImageDrop: (id: string, src: string) => void;
  onDelete: (id: string) => void;
  onEdit?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      onImageDrop(panel.id, URL.createObjectURL(file));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageDrop(panel.id, URL.createObjectURL(file));
  };

  const w = widthPct(panel.width);
  const margin = panel.align === "left" ? "0 auto 0 0"
    : panel.align === "right" ? "0 0 0 auto"
    : "0 auto";

  return (
    <div style={{ width: w, margin, position: "relative" }}
      onClick={onClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div style={{
        width: "100%", height: `${panel.height}px`,
        background: panel.image ? `url(${panel.image}) center/cover no-repeat` : "#ebebeb",
        borderTop: selected ? "2px solid #c0392b" : panel.borderSize ? (panel.borderTop !== false ? `${panel.borderSize}px solid #111` : "none") : "1px solid #d0d0d0",
        borderBottom: selected ? "2px solid #c0392b" : panel.borderSize ? (panel.borderBottom !== false ? `${panel.borderSize}px solid #111` : "none") : "1px solid #d0d0d0",
        borderLeft: selected ? "2px solid #c0392b" : panel.borderSize ? (panel.borderLeft !== false ? `${panel.borderSize}px solid #111` : "none") : "1px solid #d0d0d0",
        borderRight: selected ? "2px solid #c0392b" : panel.borderSize ? (panel.borderRight !== false ? `${panel.borderSize}px solid #111` : "none") : "1px solid #d0d0d0",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "8px",
        position: "relative", overflow: "hidden",
        boxSizing: "border-box",
      }}>
        {!panel.image && (
          <div style={{ textAlign: "center", color: "#bbb", pointerEvents: "none", userSelect: "none" }}>
            <div style={{ fontSize: "32px", marginBottom: "6px" }}>🖼️</div>
            <div style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase" }}>Glisser une image</div>
            <div style={{ fontSize: "9px", color: "#ccc", marginTop: "4px" }}>{w} · {panel.height}px</div>
          </div>
        )}
        {selected && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(192,57,43,0.08)", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "8px", paddingBottom: "12px" }}>
            <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              style={{ padding: "6px 12px", background: "#2563eb", color: "white", border: "none", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "3px" }}>
              ✏️ Modifier
            </button>
            <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              style={{ padding: "6px 14px", background: "#c0392b", color: "white", border: "none", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", cursor: "pointer", borderRadius: "3px" }}>
              📂 Image
            </button>
            {panel.image && (
              <button onClick={(e) => { e.stopPropagation(); onImageDrop(panel.id, ""); }}
                style={{ padding: "6px 10px", background: "rgba(0,0,0,0.7)", color: "white", border: "none", fontSize: "10px", cursor: "pointer", borderRadius: "3px" }}>
                ✕
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onDelete(panel.id); }}
              style={{ padding: "6px 10px", background: "rgba(0,0,0,0.7)", color: "#ff6b6b", border: "none", fontSize: "10px", cursor: "pointer", borderRadius: "3px" }}>
              🗑
            </button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

// ── SPLIT PANEL (2 côte à côte) ──
function SplitPanelComp({ panel, selected, onClick, onImageDrop, onDelete }: {
  panel: WebtoonPanel;
  selected: boolean;
  onClick: () => void;
  onImageDrop: (id: string, src: string) => void;
  onDelete: (id: string) => void;
}) {
  const splits = panel.split || [];
  return (
    <div style={{ width: "100%", display: "flex", gap: "3px", position: "relative" }}
      onClick={onClick}>
      {splits.map((sp) => {
        const fileRef = { current: null } as React.RefObject<HTMLInputElement | null>;
        return (
          <SubPanel key={sp.id} sp={sp} onImageDrop={onImageDrop} onDelete={onDelete} parentSelected={selected} />
        );
      })}
      {selected && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(panel.id); }}
          style={{ position: "absolute", top: 4, right: 4, width: "22px", height: "22px", background: "#c0392b", border: "none", color: "white", fontSize: "12px", cursor: "pointer", borderRadius: "50%", zIndex: 5 }}>
          ×
        </button>
      )}
    </div>
  );
}

function SubPanel({ sp, onImageDrop, onDelete, parentSelected }: { sp: WebtoonPanel; onImageDrop: (id: string, src: string) => void; onDelete: (id: string) => void; parentSelected: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onImageDrop(sp.id, URL.createObjectURL(file));
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageDrop(sp.id, URL.createObjectURL(file));
  };

  return (
    <div style={{ flex: 1, height: `${sp.height}px`, position: "relative" }}
      onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <div style={{
        width: "100%", height: "100%",
        background: sp.image ? `url(${sp.image}) center/cover no-repeat` : "#ebebeb",
        border: "1px solid #d0d0d0",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "6px", overflow: "hidden",
        cursor: "pointer",
      }}>
        {!sp.image && (
          <div style={{ textAlign: "center", color: "#bbb", pointerEvents: "none" }}>
            <div style={{ fontSize: "20px" }}>🖼️</div>
            <div style={{ fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase" }}>Image</div>
          </div>
        )}
        {parentSelected && (
          <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            style={{ position: "absolute", bottom: "6px", left: "50%", transform: "translateX(-50%)", padding: "4px 10px", background: "#c0392b", color: "white", border: "none", fontSize: "9px", cursor: "pointer", borderRadius: "3px" }}>
            📂
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}

// ── PAGE PRINCIPALE ──
export default function StudioPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [editingBubble, setEditingBubble] = useState<string | null>(null);
  const [sfxList, setSfxList] = useState<SFX[]>([]);
  const [selectedSfx, setSelectedSfx] = useState<string | null>(null);
  const [sfxText, setSfxText] = useState("BAM");
  const [sfxSize, setSfxSize] = useState(80);
  const [sfxColor1, setSfxColor1] = useState("#ff8c00");
  const [sfxColor2, setSfxColor2] = useState("#ff2200");
  const [sfxStroke, setSfxStroke] = useState("#ffffff");
  const [sfxRotation, setSfxRotation] = useState(-15);

  // Panel controls
  const [panelHeight, setPanelHeight] = useState(320);
  const [panelWidth, setPanelWidth] = useState<PanelWidth>("full");
  const [panelAlign, setPanelAlign] = useState<PanelAlign>("center");
  const [panelBorder, setPanelBorder] = useState(true);
  const [panelBorderSize, setPanelBorderSize] = useState(3);
  const [panelBorderTop, setPanelBorderTop] = useState(true);
  const [panelBorderBottom, setPanelBorderBottom] = useState(true);
  const [panelBorderLeft, setPanelBorderLeft] = useState(true);
  const [panelBorderRight, setPanelBorderRight] = useState(true);

  // Respiration controls
  const [respColor, setRespColor] = useState("#ffffff");
  const [respHeight, setRespHeight] = useState(200);

  // Bubble controls
  const [bubbleShape, setBubbleShape] = useState<BubbleShape>("round");
  const [bubbleText, setBubbleText] = useState("Texte...");
  const [bubbleFontSize, setBubbleFontSize] = useState(14);
  const [bubbleBg, setBubbleBg] = useState("#ffffff");
  const [bubbleColor, setBubbleColor] = useState("#000000");

  // Save / preview
  const [titre, setTitre] = useState("Épisode 1");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  // ── Projets ──
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => uid());
  const canvasRef = useRef<HTMLDivElement>(null);

  const loadProjects = useCallback(() => {
    try {
      const raw = localStorage.getItem("manodream_projects");
      setProjects(raw ? JSON.parse(raw) : []);
    } catch { setProjects([]); }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const saveProject = useCallback(async (showFeedback = true) => {
    // Miniature rapide
    let thumb = "";
    if (canvasRef.current) {
      try {
        const cvs = await html2canvas(canvasRef.current, { scale: 0.15, useCORS: true, logging: false });
        thumb = cvs.toDataURL("image/jpeg", 0.5);
      } catch {}
    }
    const project: Project = { id: currentProjectId, titre, blocks, bubbles, sfxList, savedAt: new Date().toISOString(), thumb };
    const raw = localStorage.getItem("manodream_projects");
    const all: Project[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(p => p.id === currentProjectId);
    if (idx >= 0) all[idx] = project; else all.unshift(project);
    localStorage.setItem("manodream_projects", JSON.stringify(all));
    setProjects([...all]);
    if (showFeedback) { setSaveMsg("✅ Projet sauvegardé !"); setTimeout(() => setSaveMsg(""), 3000); }
  }, [currentProjectId, titre, blocks, bubbles, sfxList]);

  const loadProject = (p: Project) => {
    setBlocks(p.blocks || []);
    setBubbles(p.bubbles || []);
    setSfxList(p.sfxList || []);
    setTitre(p.titre || "");
    setCurrentProjectId(p.id);
    setShowProjects(false);
    setSaveMsg("📂 Projet chargé !");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const newProject = () => {
    setBlocks([]); setBubbles([]); setSfxList([]);
    setTitre("Nouveau projet");
    setCurrentProjectId(uid());
    setShowProjects(false);
  };

  const deleteProject = (id: string) => {
    const all = projects.filter(p => p.id !== id);
    localStorage.setItem("manodream_projects", JSON.stringify(all));
    setProjects(all);
  };

  const exportPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    setSaveMsg("⏳ Export en cours...");
    try {
      const cvs = await html2canvas(canvasRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${titre.replace(/\s+/g, "_")}.png`;
      link.href = cvs.toDataURL("image/png");
      link.click();
      setSaveMsg("✅ PNG exporté !");
    } catch { setSaveMsg("❌ Erreur export"); }
    setTimeout(() => setSaveMsg(""), 3000);
  }, [canvasRef, titre]);

  // Sauvegarde automatique toutes les 30s
  useEffect(() => {
    const t = setInterval(() => saveProject(false), 30000);
    return () => clearInterval(t);
  }, [saveProject]);

  // Charger
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("episodes").select("*").eq("user_id", user.id)
        .order("updated_at", { ascending: false }).limit(1).single();
      if (data) {
        setEpisodeId(data.id); setTitre(data.titre);
        setBlocks(data.blocks || []); setBubbles(data.bubbles || []);
      }
    };
    load();
  }, []);

  // Sauvegarder
  const save = useCallback(async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaveMsg("Non connecté"); setSaving(false); return; }
    const payload = { user_id: user.id, titre, blocks, bubbles, updated_at: new Date().toISOString() };
    if (episodeId) {
      await supabase.from("episodes").update(payload).eq("id", episodeId);
    } else {
      const { data } = await supabase.from("episodes").insert(payload).select().single();
      if (data) setEpisodeId(data.id);
    }
    setSaveMsg("✅ Sauvegardé !"); setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }, [blocks, bubbles, titre, episodeId]);

  const makePanelData = (id?: string): WebtoonPanel => ({
    id: id || uid(), height: panelHeight, width: panelWidth, align: panelAlign,
    border: panelBorder, borderSize: panelBorderSize,
    borderTop: panelBorderTop, borderBottom: panelBorderBottom,
    borderLeft: panelBorderLeft, borderRight: panelBorderRight,
  });

  // Ajouter panel simple
  const addPanel = () => {
    setBlocks((b) => [...b, { type: "panel", data: makePanelData() }]);
  };

  // Ajouter split (2 panels côte à côte)
  const addSplit = () => {
    const sp: WebtoonPanel = {
      ...makePanelData(), width: "full", align: "center",
      split: [makePanelData(), makePanelData()],
    };
    setBlocks((b) => [...b, { type: "panel", data: sp }]);
  };

  // ── Charger les props d'un block existant dans la sidebar pour édition ──
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const loadBlockToSidebar = (block: Block) => {
    if (block.type === "respiration") {
      const r = block.data as Respiration;
      setRespColor(r.color); setRespHeight(r.height);
      setEditingBlockId(r.id);
    } else {
      const p = block.data as WebtoonPanel;
      setPanelHeight(p.height); setPanelWidth(p.width); setPanelAlign(p.align);
      setPanelBorder(p.border ?? false); setPanelBorderSize(p.borderSize ?? 3);
      setPanelBorderTop(p.borderTop ?? p.border ?? false);
      setPanelBorderBottom(p.borderBottom ?? p.border ?? false);
      setPanelBorderLeft(p.borderLeft ?? p.border ?? false);
      setPanelBorderRight(p.borderRight ?? p.border ?? false);
      setEditingBlockId(p.id);
    }
  };

  const applyBlockEdit = () => {
    if (!editingBlockId) return;
    setBlocks(prev => prev.map(b => {
      const id = (b.data as WebtoonPanel).id || (b.data as Respiration).id;
      if (id !== editingBlockId) return b;
      if (b.type === "respiration") return { ...b, data: { ...b.data, color: respColor, height: respHeight } };
      return { ...b, data: { ...b.data as WebtoonPanel, height: panelHeight, width: panelWidth, align: panelAlign, border: panelBorder, borderSize: panelBorderSize, borderTop: panelBorderTop, borderBottom: panelBorderBottom, borderLeft: panelBorderLeft, borderRight: panelBorderRight } };
    }));
    setEditingBlockId(null);
  };

  // Ajouter respiration
  const addResp = () => {
    const r: Respiration = { id: uid(), color: respColor, height: respHeight };
    setBlocks((b) => [...b, { type: "respiration", data: r }]);
  };

  // Générer un épisode template webtoon
  const generateEpisode = () => {
    const p = (height: number, width: PanelWidth = "full", align: PanelAlign = "center", split?: WebtoonPanel[]): Block => ({
      type: "panel", data: { id: uid(), height, width, align, border: true, borderSize: 3, ...(split ? { split } : {}) }
    });
    const t: Block[] = [
      p(680),
      { type: "respiration", data: { id: uid(), color: "#ffffff", height: 200 } },
      p(320),
      { type: "respiration", data: { id: uid(), color: "#ffffff", height: 200 } },
      p(320, "full", "center", [
        { id: uid(), height: 320, width: "full", align: "center", border: true, borderSize: 3 },
        { id: uid(), height: 320, width: "full", align: "center", border: true, borderSize: 3 },
      ]),
      { type: "respiration", data: { id: uid(), color: "#000000", height: 200 } },
      p(480, "wide"),
      { type: "respiration", data: { id: uid(), color: "#ffffff", height: 200 } },
      p(240, "medium", "left"),
      { type: "respiration", data: { id: uid(), color: "#ffffff", height: 200 } },
      p(480),
    ];
    setBlocks(t);
  };

  // Image dans panel
  const handleImageDrop = (panelId: string, src: string) => {
    setBlocks((prev) => prev.map((block) => {
      if (block.type !== "panel") return block;
      // Panel simple
      if (block.data.id === panelId) return { ...block, data: { ...block.data, image: src || undefined } };
      // Dans un split
      if (block.data.split) {
        return {
          ...block,
          data: {
            ...block.data,
            split: block.data.split.map((sp: WebtoonPanel) =>
              sp.id === panelId ? { ...sp, image: src || undefined } : sp
            ),
          },
        };
      }
      return block;
    }));
  };

  // Supprimer
  const deleteBlock = (id: string) => {
    setBlocks((b) => b.filter((bl) => bl.data.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Bulle
  const addBubble = () => {
    const b: Bubble = {
      id: uid(), shape: bubbleShape, text: bubbleText,
      x: 80, y: 80, width: 160, height: 100,
      fontSize: bubbleFontSize, color: bubbleColor, bgColor: bubbleBg,
    };
    setBubbles((prev) => [...prev, b]);
    setSelectedBubble(b.id);
  };

  const deleteBubble = (id: string) => {
    setBubbles((b) => b.filter((bu) => bu.id !== id));
    if (selectedBubble === id) setSelectedBubble(null);
  };

  // SFX
  const addSfx = () => {
    const s: SFX = {
      id: uid(), text: sfxText.toUpperCase(),
      x: 100, y: 80,
      fontSize: sfxSize,
      color1: sfxColor1, color2: sfxColor2,
      strokeColor: sfxStroke,
      rotation: sfxRotation,
    };
    setSfxList((prev) => [...prev, s]);
    setSelectedSfx(s.id);
  };

  const deleteSfx = (id: string) => {
    setSfxList((s) => s.filter((x) => x.id !== id));
    if (selectedSfx === id) setSelectedSfx(null);
  };

  // Raccourci clavier Delete/Backspace pour supprimer bulle ou SFX sélectionné
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBubble) deleteBubble(selectedBubble);
        if (selectedSfx) deleteSfx(selectedSfx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedBubble, selectedSfx]);

  // ── RENDER ──
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5", fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)" }}>

      {/* ── PANNEAU PROJETS ── */}
      {showProjects && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          {/* Overlay */}
          <div onClick={() => setShowProjects(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          {/* Drawer */}
          <div style={{
            position: "relative", zIndex: 201,
            width: "380px", height: "100vh", background: "#fff",
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column",
          }}>
            {/* Header */}
            <div style={{ padding: "20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "20px", letterSpacing: "3px", color: "#1a1a2e" }}>MES PROJETS</div>
                <div style={{ fontSize: "10px", color: "#aaa", letterSpacing: "1px" }}>{projects.length} projet{projects.length !== 1 ? "s" : ""} sauvegardé{projects.length !== 1 ? "s" : ""}</div>
              </div>
              <button onClick={() => setShowProjects(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#aaa" }}>✕</button>
            </div>

            {/* Bouton Nouveau projet */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <button onClick={newProject} style={{
                width: "100%", padding: "12px", background: "#1a1a2e", border: "none",
                color: "white", fontSize: "11px", fontWeight: 700, cursor: "pointer",
                borderRadius: "6px", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                ✚ Nouveau projet
              </button>
            </div>

            {/* Bouton sauvegarder projet actuel */}
            <div style={{ padding: "8px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <button onClick={() => saveProject(true)} style={{
                width: "100%", padding: "10px", background: "#2563eb", border: "none",
                color: "white", fontSize: "11px", fontWeight: 700, cursor: "pointer",
                borderRadius: "6px", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                💾 Sauvegarder le projet actuel
              </button>
            </div>

            {/* Liste des projets */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {projects.length === 0 ? (
                <div style={{ textAlign: "center", color: "#bbb", fontSize: "12px", marginTop: "40px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📂</div>
                  Aucun projet sauvegardé.<br/>Clique sur "Sauvegarder" pour commencer.
                </div>
              ) : projects.map(p => {
                const isCurrent = p.id === currentProjectId;
                const date = new Date(p.savedAt);
                const dateStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " · " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={p.id} style={{
                    border: `2px solid ${isCurrent ? "#2563eb" : "#f0f0f0"}`,
                    borderRadius: "8px", marginBottom: "10px", overflow: "hidden",
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}>
                    {/* Miniature */}
                    {p.thumb && (
                      <div style={{ height: "80px", background: "#f8f8f8", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.thumb} alt="" style={{ width: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    {!p.thumb && (
                      <div style={{ height: "60px", background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#ddd", fontSize: "24px" }}>🖼</div>
                    )}
                    <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.titre}</div>
                        <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>{dateStr} · {(p.blocks || []).length} blocks</div>
                        {isCurrent && <div style={{ fontSize: "9px", color: "#2563eb", fontWeight: 700, marginTop: "2px" }}>● EN COURS</div>}
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button onClick={() => loadProject(p)} style={{
                          padding: "5px 10px", background: isCurrent ? "#f0f4ff" : "#1a1a2e", border: "none",
                          color: isCurrent ? "#2563eb" : "white", fontSize: "9px", fontWeight: 700,
                          cursor: "pointer", borderRadius: "4px",
                        }}>{isCurrent ? "Actif" : "Ouvrir"}</button>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`Supprimer "${p.titre}" ?`)) deleteProject(p.id); }} style={{
                          padding: "5px 8px", background: "none", border: "1px solid #fee2e2",
                          color: "#ef4444", fontSize: "9px", cursor: "pointer", borderRadius: "4px",
                        }}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: "230px", flexShrink: 0, background: "#fff",
        borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column",
        padding: "14px 12px", gap: "20px",
        overflowY: "auto",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "18px", letterSpacing: "4px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", color: "#1a1a2e" }}>
          MANO<span style={{ color: "#c0392b" }}>STUDIO</span>
        </div>

        {/* Générer */}
        <div>
          <div style={L}>✦ Générer épisode</div>
          <button onClick={generateEpisode} style={btnBlue}>⚡ Génération auto</button>
        </div>

        {/* Panel */}
        <div>
          <div style={L}>📦 Ajouter un panel</div>

          {/* Hauteur */}
          <div style={{ fontSize: "9px", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>HAUTEUR</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
            {PANEL_HEIGHTS.map((ph) => (
              <button key={ph.h} onClick={() => setPanelHeight(ph.h)} style={{
                padding: "4px 8px", fontSize: "9px", fontWeight: 700, letterSpacing: "1px",
                border: panelHeight === ph.h ? "1px solid #c0392b" : "1px solid #e2e8f0",
                background: panelHeight === ph.h ? "rgba(192,57,43,0.08)" : "#f8fafc",
                color: panelHeight === ph.h ? "#c0392b" : "#555",
                cursor: "pointer", borderRadius: "3px",
              }}>{ph.label}</button>
            ))}
          </div>

          {/* Largeur */}
          <div style={{ fontSize: "9px", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>LARGEUR</div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            {PANEL_WIDTHS.map((pw) => (
              <button key={pw.val} onClick={() => setPanelWidth(pw.val)} style={{
                flex: 1, padding: "4px 2px", fontSize: "8px", fontWeight: 700,
                border: panelWidth === pw.val ? "1px solid #c0392b" : "1px solid #e2e8f0",
                background: panelWidth === pw.val ? "rgba(192,57,43,0.08)" : "#f8fafc",
                color: panelWidth === pw.val ? "#c0392b" : "#555",
                cursor: "pointer", borderRadius: "3px",
              }}>{pw.label}</button>
            ))}
          </div>

          {/* Alignement (seulement si pas pleine largeur) */}
          {panelWidth !== "full" && (
            <>
              <div style={{ fontSize: "9px", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>ALIGNEMENT</div>
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                {PANEL_ALIGNS.map((pa) => (
                  <button key={pa.val} onClick={() => setPanelAlign(pa.val)} style={{
                    flex: 1, padding: "5px 2px", fontSize: "14px",
                    border: panelAlign === pa.val ? "1px solid #c0392b" : "1px solid #e2e8f0",
                    background: panelAlign === pa.val ? "rgba(192,57,43,0.08)" : "#f8fafc",
                    cursor: "pointer", borderRadius: "3px",
                  }}>{pa.icon}</button>
                ))}
              </div>
            </>
          )}

          {/* Bordures par côté */}
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "9px", color: "#888", letterSpacing: "1px", marginBottom: "6px" }}>BORDURES</div>
            {/* Épaisseur */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
              {[0, 2, 3, 5, 8].map((s) => (
                <button key={s} onClick={() => setPanelBorderSize(s)} style={{
                  flex: 1, padding: "4px 2px", fontSize: "9px", fontWeight: 700,
                  background: panelBorderSize === s ? "#111" : "#f8fafc",
                  color: panelBorderSize === s ? "#fff" : "#555",
                  border: panelBorderSize === s ? "2px solid #111" : "1px solid #ddd",
                  cursor: "pointer", borderRadius: "3px",
                }}>{s === 0 ? "OFF" : `${s}px`}</button>
              ))}
            </div>
            {/* Sélecteur côtés — visuel en croix */}
            {panelBorderSize > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: "3px", width: "90px", margin: "0 auto 6px" }}>
                <div/>
                <button onClick={() => setPanelBorderTop(!panelBorderTop)} style={{ height: "26px", background: panelBorderTop ? "#111" : "#f0f0f0", border: "1px solid #ccc", borderRadius: "3px", cursor: "pointer", fontSize: "9px", color: panelBorderTop ? "#fff" : "#aaa", fontWeight: 700 }}>↑</button>
                <div/>
                <button onClick={() => setPanelBorderLeft(!panelBorderLeft)} style={{ height: "26px", background: panelBorderLeft ? "#111" : "#f0f0f0", border: "1px solid #ccc", borderRadius: "3px", cursor: "pointer", fontSize: "9px", color: panelBorderLeft ? "#fff" : "#aaa", fontWeight: 700 }}>←</button>
                <div style={{ background: "#e0e0e0", borderRadius: "2px" }}/>
                <button onClick={() => setPanelBorderRight(!panelBorderRight)} style={{ height: "26px", background: panelBorderRight ? "#111" : "#f0f0f0", border: "1px solid #ccc", borderRadius: "3px", cursor: "pointer", fontSize: "9px", color: panelBorderRight ? "#fff" : "#aaa", fontWeight: 700 }}>→</button>
                <div/>
                <button onClick={() => setPanelBorderBottom(!panelBorderBottom)} style={{ height: "26px", background: panelBorderBottom ? "#111" : "#f0f0f0", border: "1px solid #ccc", borderRadius: "3px", cursor: "pointer", fontSize: "9px", color: panelBorderBottom ? "#fff" : "#aaa", fontWeight: 700 }}>↓</button>
                <div/>
              </div>
            )}
          </div>

          {/* Bouton Appliquer si on édite un block existant */}
          {editingBlockId ? (
            <div style={{ marginBottom: "8px", padding: "8px", background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: "6px" }}>
              <div style={{ fontSize: "8px", color: "#2563eb", fontWeight: 700, marginBottom: "6px" }}>✏️ MODIFICATION EN COURS</div>
              <button onClick={applyBlockEdit} style={{ ...btnBlue, background: "#2563eb", marginBottom: "4px" }}>✅ Appliquer les changements</button>
              <button onClick={() => setEditingBlockId(null)} style={{ width: "100%", padding: "5px", background: "none", border: "1px solid #ddd", color: "#888", fontSize: "9px", cursor: "pointer", borderRadius: "3px" }}>Annuler</button>
            </div>
          ) : (
            <>
              <button onClick={addPanel} style={btnBlue}>+ Panel simple</button>
              <button onClick={addSplit} style={{ ...btnBlue, marginTop: "4px", background: "#64748b" }}>⊞ Split 2 panels</button>
            </>
          )}
        </div>

        {/* Respiration */}
        <div>
          <div style={L}>⬜ Espace de respiration</div>
          <div style={{ fontSize: "9px", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>HAUTEUR : {respHeight}px</div>
          <input type="range" min="80" max="500" step="20" value={respHeight} onChange={(e) => setRespHeight(Number(e.target.value))}
            style={{ width: "100%", marginBottom: "8px", accentColor: "#c0392b" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
            {RESP_COLORS.map((c) => (
              <button key={c.color} onClick={() => setRespColor(c.color)} title={c.label} style={{
                width: "26px", height: "26px", borderRadius: "3px", background: c.color,
                border: respColor === c.color ? "2px solid #c0392b" : "1px solid #ccc",
                cursor: "pointer",
              }} />
            ))}
            <input type="color" value={respColor} onChange={(e) => setRespColor(e.target.value)}
              style={{ width: "26px", height: "26px", border: "1px solid #ccc", cursor: "pointer", padding: 0, borderRadius: "3px" }} />
          </div>
          <div style={{ fontSize: "9px", color: "#aaa", marginBottom: "6px" }}>⚠️ Min. recommandé : 200px</div>
          <button onClick={addResp} style={btnGray}>+ Ajouter espace</button>
        </div>

        {/* Bulles */}
        <div>
          <div style={L}>💬 Bulles de dialogue</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
            {BUBBLE_SHAPES.map((bs) => (
              <button key={bs.shape} onClick={() => setBubbleShape(bs.shape)} title={bs.label} style={{
                width: "38px", height: "38px", fontSize: "16px",
                background: bubbleShape === bs.shape ? "rgba(192,57,43,0.1)" : "#f8fafc",
                border: bubbleShape === bs.shape ? "1px solid #c0392b" : "1px solid #e2e8f0",
                cursor: "pointer", borderRadius: "3px",
              }}>{bs.icon}</button>
            ))}
          </div>
          <input value={bubbleText} onChange={(e) => setBubbleText(e.target.value)}
            placeholder="Texte..." style={{ ...inputS, marginBottom: "6px" }} />
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "9px", color: "#888" }}>Taille</span>
            <input type="range" min="10" max="28" value={bubbleFontSize} onChange={(e) => setBubbleFontSize(Number(e.target.value))} style={{ flex: 1, accentColor: "#c0392b" }} />
            <span style={{ fontSize: "10px", color: "#888", width: "20px" }}>{bubbleFontSize}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <div><div style={{ fontSize: "8px", color: "#888", marginBottom: "2px" }}>Fond</div>
              <input type="color" value={bubbleBg} onChange={(e) => setBubbleBg(e.target.value)} style={{ width: "34px", height: "26px", border: "1px solid #ccc", cursor: "pointer", padding: 0 }} /></div>
            <div><div style={{ fontSize: "8px", color: "#888", marginBottom: "2px" }}>Texte</div>
              <input type="color" value={bubbleColor} onChange={(e) => setBubbleColor(e.target.value)} style={{ width: "34px", height: "26px", border: "1px solid #ccc", cursor: "pointer", padding: 0 }} /></div>
          </div>
          <button onClick={addBubble} style={btnBlue}>+ Ajouter bulle</button>

          {/* Contrôles bulle sélectionnée */}
          {selectedBubble && (() => {
            const b = bubbles.find(x => x.id === selectedBubble);
            if (!b) return null;
            const update = (patch: Partial<Bubble>) =>
              setBubbles(prev => prev.map(x => x.id === selectedBubble ? { ...x, ...patch } : x));
            return (
              <div style={{ marginTop: "8px", padding: "10px", background: "rgba(192,57,43,0.04)", border: "1px solid rgba(192,57,43,0.15)", borderRadius: "6px" }}>
                <div style={{ fontSize: "9px", color: "#c0392b", letterSpacing: "1px", marginBottom: "8px", fontWeight: 700 }}>✏️ BULLE SÉLECTIONNÉE</div>

                {/* Taille */}
                <div style={{ fontSize: "8px", color: "#888", marginBottom: "4px" }}>TAILLE</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "7px", color: "#aaa", marginBottom: "2px" }}>LARGEUR</div>
                    <input type="number" value={b.width} min={60} max={800}
                      onChange={e => update({ width: Number(e.target.value) })}
                      style={{ width: "100%", padding: "5px", border: "1px solid #e2e8f0", borderRadius: "3px", fontSize: "11px", fontWeight: 700 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "7px", color: "#aaa", marginBottom: "2px" }}>HAUTEUR</div>
                    <input type="number" value={b.height} min={40} max={600}
                      onChange={e => update({ height: Number(e.target.value) })}
                      style={{ width: "100%", padding: "5px", border: "1px solid #e2e8f0", borderRadius: "3px", fontSize: "11px", fontWeight: 700 }} />
                  </div>
                </div>

                {/* Position */}
                <div style={{ fontSize: "8px", color: "#888", marginBottom: "4px" }}>POSITION</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "7px", color: "#aaa", marginBottom: "2px" }}>X</div>
                    <input type="number" value={b.x}
                      onChange={e => update({ x: Number(e.target.value) })}
                      style={{ width: "100%", padding: "5px", border: "1px solid #e2e8f0", borderRadius: "3px", fontSize: "11px", fontWeight: 700 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "7px", color: "#aaa", marginBottom: "2px" }}>Y</div>
                    <input type="number" value={b.y}
                      onChange={e => update({ y: Number(e.target.value) })}
                      style={{ width: "100%", padding: "5px", border: "1px solid #e2e8f0", borderRadius: "3px", fontSize: "11px", fontWeight: 700 }} />
                  </div>
                </div>

                {/* Taille police */}
                <div style={{ fontSize: "8px", color: "#888", marginBottom: "4px" }}>TAILLE POLICE : {b.fontSize}px</div>
                <input type="range" min="10" max="36" value={b.fontSize}
                  onChange={e => update({ fontSize: Number(e.target.value) })}
                  style={{ width: "100%", marginBottom: "8px", accentColor: "#c0392b" }} />

                {/* Alignement texte */}
                <div style={{ fontSize: "8px", color: "#888", marginBottom: "4px" }}>ALIGNEMENT</div>
                <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
                  {(["left", "center", "right"] as const).map((a) => {
                    const icons = { left: "⬅ Gauche", center: "↔ Centre", right: "Droite ➡" };
                    const active = (b.textAlign ?? "center") === a;
                    return (
                      <button key={a} onClick={() => update({ textAlign: a })} style={{
                        flex: 1, padding: "6px 2px", border: `1px solid ${active ? "#c0392b" : "#e0e0e0"}`,
                        background: active ? "#c0392b" : "#fff", color: active ? "#fff" : "#555",
                        fontSize: "9px", fontWeight: 700, cursor: "pointer", borderRadius: "3px",
                        letterSpacing: "0.5px",
                      }}>{icons[a]}</button>
                    );
                  })}
                </div>

                <button onClick={() => { deleteBubble(selectedBubble); }} style={{
                  width: "100%", padding: "7px", background: "#c0392b", border: "none",
                  color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px",
                }}>🗑 Supprimer</button>
                <div style={{ fontSize: "8px", color: "#bbb", textAlign: "center", marginTop: "3px" }}>ou ⌫ Delete</div>
              </div>
            );
          })()}
        </div>

        {/* ── SECTION SFX ── */}
        <div>
          <div style={L}>💥 Effets sonores (SFX)</div>

          {/* Presets rapides */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
            {SFX_PRESETS.map((p) => (
              <button key={p.label} onClick={() => {
                setSfxText(p.label);
                setSfxColor1(p.color1);
                setSfxColor2(p.color2);
                setSfxStroke(p.stroke);
              }} style={{
                padding: "4px 8px", fontSize: "9px", fontWeight: 700,
                background: `linear-gradient(135deg, ${p.color1}, ${p.color2})`,
                color: p.stroke === "#ffffff" ? "#fff" : "#000",
                border: "none", cursor: "pointer", borderRadius: "3px",
                letterSpacing: "1px", textShadow: `0 0 3px ${p.stroke}`,
              }}>{p.label}</button>
            ))}
          </div>

          {/* Texte personnalisé */}
          <input value={sfxText} onChange={(e) => setSfxText(e.target.value.toUpperCase())}
            placeholder="BAM, BOUM, TCHAC..." style={{ ...inputS, marginBottom: "6px", fontFamily: "var(--font-bangers, 'Bangers', sans-serif)", fontSize: "16px", letterSpacing: "2px" }} />

          {/* Taille */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "9px", color: "#888" }}>Taille</span>
            <input type="range" min="30" max="160" value={sfxSize} onChange={(e) => setSfxSize(Number(e.target.value))} style={{ flex: 1, accentColor: "#c0392b" }} />
            <span style={{ fontSize: "10px", color: "#888", width: "28px" }}>{sfxSize}px</span>
          </div>

          {/* Rotation */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "9px", color: "#888" }}>Rotation</span>
            <input type="range" min="-45" max="45" value={sfxRotation} onChange={(e) => setSfxRotation(Number(e.target.value))} style={{ flex: 1, accentColor: "#c0392b" }} />
            <span style={{ fontSize: "10px", color: "#888", width: "28px" }}>{sfxRotation}°</span>
          </div>

          {/* Couleurs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
            <div><div style={{ fontSize: "8px", color: "#888", marginBottom: "2px" }}>Couleur 1</div>
              <input type="color" value={sfxColor1} onChange={(e) => setSfxColor1(e.target.value)} style={{ width: "34px", height: "26px", border: "1px solid #ccc", cursor: "pointer", padding: 0 }} /></div>
            <div><div style={{ fontSize: "8px", color: "#888", marginBottom: "2px" }}>Couleur 2</div>
              <input type="color" value={sfxColor2} onChange={(e) => setSfxColor2(e.target.value)} style={{ width: "34px", height: "26px", border: "1px solid #ccc", cursor: "pointer", padding: 0 }} /></div>
            <div><div style={{ fontSize: "8px", color: "#888", marginBottom: "2px" }}>Contour</div>
              <input type="color" value={sfxStroke} onChange={(e) => setSfxStroke(e.target.value)} style={{ width: "34px", height: "26px", border: "1px solid #ccc", cursor: "pointer", padding: 0 }} /></div>
          </div>

          <button onClick={addSfx} style={{ ...btnBlue, background: "linear-gradient(135deg, #ff8c00, #ff2200)" }}>
            💥 Ajouter SFX
          </button>

          {selectedSfx && (
            <div style={{ marginTop: "8px", padding: "8px", background: "rgba(255,100,0,0.06)", border: "1px solid rgba(255,100,0,0.2)", borderRadius: "6px" }}>
              <div style={{ fontSize: "9px", color: "#ff6600", letterSpacing: "1px", marginBottom: "5px", fontWeight: 700 }}>SFX SÉLECTIONNÉ</div>
              <button onClick={() => deleteSfx(selectedSfx)} style={{ width: "100%", padding: "7px", background: "#c0392b", border: "none", color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px" }}>
                🗑 Supprimer ce SFX
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ZONE CENTRALE ── */}
      <div style={{ marginLeft: "230px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0 100px", background: "#f0f2f5", overflowX: "hidden" }}>

        {/* Barre du haut */}
        <div style={{ width: "100%", maxWidth: "800px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <input value={titre} onChange={(e) => setTitre(e.target.value)}
            style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "22px", letterSpacing: "3px", color: "#1a1a2e", border: "none", background: "transparent", outline: "none", flex: 1, minWidth: "120px" }} />
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            {saveMsg && <span style={{ fontSize: "11px", color: "#4a90d9", whiteSpace: "nowrap" }}>{saveMsg}</span>}
            <button onClick={() => { setShowProjects(true); loadProjects(); }} style={{
              padding: "7px 12px", background: "#1a1a2e", border: "none",
              color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px", letterSpacing: "0.5px",
            }}>📁 Projets</button>
            <button onClick={() => setPreview(!preview)} style={{
              padding: "7px 12px", background: preview ? "#c0392b" : "#f0f2f5",
              border: "1px solid #e2e8f0", color: preview ? "white" : "#64748b",
              fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px", letterSpacing: "0.5px",
            }}>{preview ? "✏️ Éditer" : "👁 Aperçu"}</button>
            <button onClick={() => saveProject()} style={{
              padding: "7px 12px", background: "#2563eb", border: "none",
              color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px", letterSpacing: "0.5px",
            }}>💾 Sauvegarder</button>
            <button onClick={exportPNG} style={{
              padding: "7px 12px", background: "#16a34a", border: "none",
              color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px", letterSpacing: "0.5px",
            }}>⬇️ Export PNG</button>
            <button onClick={() => {
              localStorage.setItem("manodream_episode_1", JSON.stringify({ blocks, bubbles, sfxList, titre, publishedAt: new Date().toISOString() }));
              setSaveMsg("🚀 Publié dans l'épisode 1 !");
              setTimeout(() => setSaveMsg(""), 3000);
            }} style={{
              padding: "7px 12px", background: "#7c3aed", border: "none",
              color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px", letterSpacing: "0.5px",
            }}>🚀 Publier Ep.1</button>
            <a href="/" style={{ fontSize: "10px", color: "#94a3b8", letterSpacing: "1px", textDecoration: "none" }}>← Retour</a>
          </div>
        </div>

        {/* MODE PREVIEW — overlay plein écran sur le canvas */}
        {preview && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.92)",
            display: "flex", flexDirection: "column", alignItems: "center",
            overflowY: "auto",
          }}>
            {/* Barre du haut */}
            <div style={{
              position: "sticky", top: 0, zIndex: 10, width: "100%",
              background: "rgba(0,0,0,0.95)", borderBottom: "1px solid #222",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 20px",
            }}>
              <span style={{ fontFamily: "var(--font-bebas,'Bebas Neue',sans-serif)", fontSize: "14px", letterSpacing: "3px", color: "#fff" }}>
                APERÇU — {titre}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={exportPNG} style={{ padding: "6px 14px", background: "#16a34a", border: "none", color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px" }}>⬇️ Export PNG</button>
                <button onClick={() => setPreview(false)} style={{ padding: "6px 14px", background: "#c0392b", border: "none", color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "4px" }}>✕ Fermer</button>
              </div>
            </div>
            {/* Canvas en lecture seule — pointer-events none */}
            <div style={{ width: "800px", maxWidth: "100vw", marginTop: "20px", marginBottom: "40px" }}>
              <div ref={canvasRef} style={{ width: "100%", background: "#fff", position: "relative", pointerEvents: "none" }}>
                {blocks.map((block) => {
                  if (block.type === "respiration") {
                    const r = block.data as Respiration;
                    return <div key={r.id} style={{ width: "100%", height: r.height, background: r.color }} />;
                  }
                  const p = block.data as WebtoonPanel;
                  if (p.split) return (
                    <div key={p.id} style={{ display: "flex", gap: "2px", width: "100%" }}>
                      {p.split.map((sp: WebtoonPanel) => (
                        <div key={sp.id} style={{ flex: 1, height: p.height, background: "#e0e0e0", border: sp.border ? `${sp.borderSize||3}px solid #111` : "none", overflow: "hidden" }}>
                          {sp.image && <img src={sp.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                        </div>
                      ))}
                    </div>
                  );
                  const w = widthPct(p.width);
                  const m = p.align === "left" ? "0 auto 0 0" : p.align === "right" ? "0 0 0 auto" : "0 auto";
                  return (
                    <div key={p.id} style={{ width: w, margin: m, height: p.height, background: "#e0e0e0", border: p.border ? `${p.borderSize||3}px solid #111` : "none", position: "relative", overflow: "hidden" }}>
                      {p.image && <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                    </div>
                  );
                })}
                {/* Bulles */}
                {bubbles.map(bubble => (
                  <div key={bubble.id} style={{ position: "absolute", left: bubble.x, top: bubble.y, width: bubble.width, height: bubble.height, pointerEvents: "none" }}>
                    <BubbleSVG shape={bubble.shape} text={bubble.text} fontSize={bubble.fontSize} color={bubble.color} bgColor={bubble.bgColor} textAlign={bubble.textAlign ?? "center"} />
                  </div>
                ))}
                {/* SFX */}
                {sfxList.map(sfx => {
                  const gradId = `prev-sfx-${sfx.id}`;
                  return (
                    <div key={sfx.id} style={{ position: "absolute", left: sfx.x, top: sfx.y, transform: `rotate(${sfx.rotation}deg)`, transformOrigin: "center", pointerEvents: "none" }}>
                      <svg style={{ overflow: "visible" }} viewBox={`0 0 ${sfx.text.length * sfx.fontSize * 0.65} ${sfx.fontSize * 1.3}`} width={sfx.text.length * sfx.fontSize * 0.65} height={sfx.fontSize * 1.3}>
                        <defs><linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={sfx.color1}/><stop offset="100%" stopColor={sfx.color2}/></linearGradient></defs>
                        <text x="50%" y="85%" textAnchor="middle" fontFamily="var(--font-bangers,'Bangers',sans-serif)" fontSize={sfx.fontSize} fontWeight="400" stroke={sfx.strokeColor} strokeWidth="4" strokeLinejoin="round" paintOrder="stroke">{sfx.text}</text>
                        <text x="50%" y="85%" textAnchor="middle" fontFamily="var(--font-bangers,'Bangers',sans-serif)" fontSize={sfx.fontSize} fontWeight="400" fill={`url(#${gradId})`}>{sfx.text}</text>
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Canvas principal */}
        {blocks.length === 0 && !preview && (
          <div style={{
            width: "100%", maxWidth: "800px", height: "280px",
            border: "2px dashed #d0d0d0", borderRadius: "8px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "12px", color: "#bbb", background: "#fff",
          }}>
            <div style={{ fontSize: "40px" }}>🎨</div>
            <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" }}>
              Ajoute un panel ou génère un épisode
            </div>
            <div style={{ fontSize: "10px", color: "#ddd" }}>Format webtoon · 800px · scroll vertical</div>
          </div>
        )}

        {!preview && (
          <div ref={canvasRef} style={{ width: "100%", maxWidth: "800px", background: "#fff", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            {blocks.map((block) => {
              if (block.type === "respiration") {
                const r = block.data as Respiration;
                const isSelected = selectedId === r.id;
                return (
                  <div key={r.id} onClick={() => setSelectedId(isSelected ? null : r.id)}
                    style={{
                      width: "100%", height: `${r.height}px`, background: r.color,
                      position: "relative", cursor: "pointer",
                      outline: isSelected ? "2px dashed #c0392b" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {isSelected && (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        {RESP_COLORS.map((c) => (
                          <button key={c.color} onClick={(e) => {
                            e.stopPropagation();
                            setBlocks((prev) => prev.map((b) =>
                              b.type === "respiration" && b.data.id === r.id ? { ...b, data: { ...b.data, color: c.color } } : b
                            ));
                          }} style={{
                            width: "22px", height: "22px", background: c.color,
                            border: r.color === c.color ? "2px solid #c0392b" : "1px solid #aaa",
                            cursor: "pointer", borderRadius: "2px",
                          }} />
                        ))}
                        <span style={{ fontSize: "10px", color: r.color === "#ffffff" ? "#999" : "#eee", margin: "0 4px" }}>{r.height}px</span>
                        <button onClick={(e) => { e.stopPropagation(); loadBlockToSidebar(block); }}
                          style={{ background: "#2563eb", border: "none", color: "white", cursor: "pointer", fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "3px" }}>✏️ Modifier</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteBlock(r.id); }}
                          style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "14px" }}>🗑</button>
                      </div>
                    )}
                  </div>
                );
              }

              const p = block.data as WebtoonPanel;
              const isSelected = selectedId === p.id;

              if (p.split) {
                return (
                  <SplitPanelComp
                    key={p.id} panel={p} selected={isSelected}
                    onClick={() => setSelectedId(isSelected ? null : p.id)}
                    onImageDrop={handleImageDrop} onDelete={deleteBlock}
                  />
                );
              }

              return (
                <PanelComp
                  key={p.id} panel={p} selected={isSelected}
                  onClick={() => setSelectedId(isSelected ? null : p.id)}
                  onImageDrop={handleImageDrop} onDelete={deleteBlock}
                  onEdit={() => loadBlockToSidebar({ type: "panel", data: p })}
                />
              );
            })}

            {/* Bulles flottantes */}
            {bubbles.map((bubble) => (
              <BubbleEl
                key={bubble.id} bubble={bubble}
                selected={selectedBubble === bubble.id}
                editing={editingBubble === bubble.id}
                onSelect={() => { setSelectedBubble(bubble.id === selectedBubble ? null : bubble.id); setSelectedSfx(null); }}
                onDrag={(dx, dy) => setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, x: b.x + dx, y: b.y + dy } : b))}
                onEdit={() => setEditingBubble(bubble.id)}
                onTextChange={(t) => setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, text: t } : b))}
                onStopEdit={() => setEditingBubble(null)}
                onDelete={() => { deleteBubble(bubble.id); setSelectedBubble(null); }}
                onResize={(dw, dh, anchor) => setBubbles((prev) => prev.map((b) => {
                  if (b.id !== bubble.id) return b;
                  let { x, y, width, height } = b;
                  if (anchor.includes("e")) width = Math.max(80, width + dw);
                  if (anchor.includes("w")) { width = Math.max(80, width - dw); x += dw; }
                  if (anchor.includes("s")) height = Math.max(60, height + dh);
                  if (anchor.includes("n")) { height = Math.max(60, height - dh); y += dh; }
                  return { ...b, x, y, width, height };
                }))}
              />
            ))}

            {/* SFX flottants */}
            {sfxList.map((sfx) => (
              <SfxEl
                key={sfx.id} sfx={sfx}
                selected={selectedSfx === sfx.id}
                onSelect={() => { setSelectedSfx(sfx.id === selectedSfx ? null : sfx.id); setSelectedBubble(null); }}
                onDrag={(dx, dy) => setSfxList((prev) => prev.map((s) => s.id === sfx.id ? { ...s, x: s.x + dx, y: s.y + dy } : s))}
                onDelete={() => deleteSfx(sfx.id)}
                onRotate={(dr) => setSfxList((prev) => prev.map((s) => s.id === sfx.id ? { ...s, rotation: s.rotation + dr } : s))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── BULLE DRAGGABLE ──
function BubbleEl({ bubble, selected, editing, onSelect, onDrag, onEdit, onTextChange, onStopEdit, onDelete, onResize }: {
  bubble: Bubble; selected: boolean; editing: boolean;
  onSelect: () => void; onDrag: (dx: number, dy: number) => void;
  onEdit: () => void; onTextChange: (t: string) => void;
  onStopEdit: () => void; onDelete: () => void; onResize: (dw: number, dh: number, anchor: string) => void;
}) {
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragStart.current = { x: e.clientX, y: e.clientY };
    onSelect();
    const move = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      onDrag(ev.clientX - dragStart.current.x, ev.clientY - dragStart.current.y);
      dragStart.current = { x: ev.clientX, y: ev.clientY };
    };
    const up = () => { dragStart.current = null; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const makeResizeHandler = (anchor: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY };
    const move = (ev: MouseEvent) => {
      onResize(ev.clientX - start.x, ev.clientY - start.y, anchor);
      start.x = ev.clientX;
      start.y = ev.clientY;
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // 8 poignées de resize
  const handleStyle = (cursor: string, top: string | number, left: string | number, transform?: string): React.CSSProperties => ({
    position: "absolute", width: 10, height: 10,
    background: "#fff", border: "2px solid #c0392b", borderRadius: "2px",
    cursor, zIndex: 40,
    top, left, transform: transform || "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
  });

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit(); }}
      onWheel={selected ? (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Mollette : resize par pas de 4px (peu sensible)
        const delta = e.deltaY > 0 ? -4 : 4;
        if (e.shiftKey) {
          // Shift + mollette = hauteur seulement
          onResize(0, -delta, "s");
        } else if (e.ctrlKey || e.metaKey) {
          // Ctrl + mollette = largeur seulement
          onResize(-delta, 0, "e");
        } else {
          // Mollette seule = les deux (proportionnel)
          onResize(-delta, -delta * 0.6, "se");
        }
      } : undefined}
      style={{
        position: "absolute", left: bubble.x, top: bubble.y,
        width: bubble.width,
        height: bubble.height,
        cursor: "move", userSelect: "none",
        outline: selected ? "2px dashed #c0392b" : "none",
        zIndex: 10, overflow: "visible",
      }}>

      {editing ? (
        <div
          contentEditable suppressContentEditableWarning
          onBlur={(e) => { onTextChange(e.currentTarget.innerText); onStopEdit(); }}
          onInput={(e) => onTextChange((e.target as HTMLDivElement).innerText)}
          ref={(el) => { if (el) { el.focus(); const range = document.createRange(); range.selectNodeContents(el); range.collapse(false); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); } }}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.88)", color: "white", border: "2px dashed rgba(192,57,43,0.7)",
            fontSize: `${bubble.fontSize}px`, textAlign: bubble.textAlign ?? "center",
            padding: "10px 14px", zIndex: 20, borderRadius: "4px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: (bubble.shape === "narration" || bubble.shape === "caption")
              ? "var(--font-nunito, 'Nunito', Georgia, serif)"
              : "var(--font-oswald, 'Oswald', sans-serif)",
            fontWeight: 700,
            fontStyle: (bubble.shape === "narration" || bubble.shape === "caption") ? "italic" : "normal",
            textTransform: (bubble.shape === "narration" || bubble.shape === "caption") ? "none" : "uppercase",
            letterSpacing: (bubble.shape === "narration" || bubble.shape === "caption") ? "0.3px" : "1px",
            lineHeight: (bubble.shape === "narration" || bubble.shape === "caption") ? 1.5 : 1.3,
            outline: "none", cursor: "text", whiteSpace: "pre-wrap", wordBreak: "break-word",
            boxSizing: "border-box",
          }}
        >{bubble.text}</div>
      ) : (
        <BubbleSVG shape={bubble.shape} text={bubble.text} fontSize={bubble.fontSize} color={bubble.color} bgColor={bubble.bgColor} textAlign={bubble.textAlign ?? "center"} />
      )}

      {/* Barre d'actions flottante au-dessus de la bulle */}
      {selected && !editing && (
        <div style={{
          position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "4px", marginBottom: "6px",
          background: "#1a1a2e", borderRadius: "6px", padding: "4px 6px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 30, whiteSpace: "nowrap",
        }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ padding: "4px 8px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: "10px", cursor: "pointer", borderRadius: "3px", fontWeight: 600 }}
            title="Double-clic pour éditer">
            ✏️ Éditer
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ padding: "4px 10px", background: "#c0392b", border: "none", color: "white", fontSize: "11px", fontWeight: 700, cursor: "pointer", borderRadius: "3px", letterSpacing: "0.5px" }}>
            🗑
          </button>
        </div>
      )}

      {/* 8 poignées de resize */}
      {selected && !editing && (<>
        {/* Poignée unique — coin bas droite, glisser pour redimensionner */}
        <div onMouseDown={makeResizeHandler("se")} style={{
          position: "absolute", width: 26, height: 26,
          background: "#c0392b", borderRadius: "5px",
          cursor: "se-resize", zIndex: 40,
          bottom: -13, right: -13,
          boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", color: "white", userSelect: "none",
        }}>↘</div>
      </>)}
    </div>
  );
}

// ── SFX DRAGGABLE ──
function SfxEl({ sfx, selected, onSelect, onDrag, onDelete, onRotate }: {
  sfx: SFX; selected: boolean;
  onSelect: () => void;
  onDrag: (dx: number, dy: number) => void;
  onDelete: () => void;
  onRotate: (dr: number) => void;
}) {
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const gradId = `sfx-grad-${sfx.id}`;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragStart.current = { x: e.clientX, y: e.clientY };
    onSelect();
    const move = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      onDrag(ev.clientX - dragStart.current.x, ev.clientY - dragStart.current.y);
      dragStart.current = { x: ev.clientX, y: ev.clientY };
    };
    const up = () => { dragStart.current = null; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: sfx.x, top: sfx.y,
        transform: `rotate(${sfx.rotation}deg)`,
        transformOrigin: "center center",
        cursor: "move", userSelect: "none",
        zIndex: 20,
        outline: selected ? "2px dashed rgba(255,140,0,0.6)" : "none",
        outlineOffset: "4px",
        borderRadius: "4px",
      }}
    >
      {/* Le texte SVG avec dégradé + contour */}
      <svg
        style={{ display: "block", overflow: "visible" }}
        viewBox={`0 0 ${sfx.text.length * sfx.fontSize * 0.65} ${sfx.fontSize * 1.3}`}
        width={sfx.text.length * sfx.fontSize * 0.65}
        height={sfx.fontSize * 1.3}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={sfx.color1} />
            <stop offset="100%" stopColor={sfx.color2} />
          </linearGradient>
        </defs>
        {/* Contour (stroke) */}
        <text
          x="50%" y="85%"
          textAnchor="middle"
          fontFamily="var(--font-bangers, 'Bangers', 'Bebas Neue', sans-serif)"
          fontSize={sfx.fontSize}
          fontWeight="bold"
          fill="none"
          stroke={sfx.strokeColor}
          strokeWidth={sfx.fontSize * 0.12}
          strokeLinejoin="round"
          letterSpacing="2"
        >{sfx.text}</text>
        {/* Remplissage dégradé */}
        <text
          x="50%" y="85%"
          textAnchor="middle"
          fontFamily="var(--font-bangers, 'Bangers', 'Bebas Neue', sans-serif)"
          fontSize={sfx.fontSize}
          fontWeight="bold"
          fill={`url(#${gradId})`}
          letterSpacing="2"
        >{sfx.text}</text>
      </svg>

      {/* Barre d'actions */}
      {selected && (
        <div style={{
          position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%) rotate(0deg)",
          display: "flex", gap: "4px", marginBottom: "8px",
          background: "#1a1a2e", borderRadius: "6px", padding: "4px 6px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 30, whiteSpace: "nowrap",
        }}>
          <button onClick={(e) => { e.stopPropagation(); onRotate(-5); }}
            style={{ padding: "4px 8px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: "12px", cursor: "pointer", borderRadius: "3px" }}>↺</button>
          <button onClick={(e) => { e.stopPropagation(); onRotate(5); }}
            style={{ padding: "4px 8px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: "12px", cursor: "pointer", borderRadius: "3px" }}>↻</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ padding: "4px 10px", background: "#c0392b", border: "none", color: "white", fontSize: "10px", fontWeight: 700, cursor: "pointer", borderRadius: "3px" }}>🗑 Suppr.</button>
        </div>
      )}
    </div>
  );
}

// ── STYLES ──
const L: React.CSSProperties = { fontSize: "9px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#c0392b", marginBottom: "8px" };
const btnBlue: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "#c0392b", border: "none", color: "white", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", cursor: "pointer", textTransform: "uppercase", marginBottom: "2px", borderRadius: "4px" };
const btnGray: React.CSSProperties = { ...btnBlue, background: "#64748b" };
const inputS: React.CSSProperties = { width: "100%", padding: "7px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "12px", outline: "none", borderRadius: "4px" };
