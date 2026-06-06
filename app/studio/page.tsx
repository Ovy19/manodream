"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── TYPES ──
type PanelShape = "rect" | "diag-right" | "diag-left" | "small-square" | "full";
type BubbleShape = "round" | "rect" | "explosion" | "thought" | "shout";

interface Panel {
  id: string;
  shape: PanelShape;
  image?: string;
  flex: number; // hauteur relative
}

interface Respiration {
  id: string;
  color: string; // "#000" | "#fff" | custom
  height: number; // px
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
}

interface Row {
  id: string;
  panels: Panel[];
  cols: number;
}

type Block =
  | { type: "row"; data: Row }
  | { type: "respiration"; data: Respiration };

// ── LAYOUTS PRÉDÉFINIS ──
const LAYOUTS: { label: string; icon: string; cols: number; panels: { shape: PanelShape; flex: number }[] }[] = [
  { label: "1 grand panel", icon: "⬜", cols: 1, panels: [{ shape: "full", flex: 1 }] },
  { label: "2 égaux", icon: "⬜⬜", cols: 2, panels: [{ shape: "rect", flex: 1 }, { shape: "rect", flex: 1 }] },
  { label: "3 colonnes", icon: "⬜⬜⬜", cols: 3, panels: [{ shape: "rect", flex: 1 }, { shape: "rect", flex: 1 }, { shape: "rect", flex: 1 }] },
  { label: "Grand + petit", icon: "▬▭", cols: 2, panels: [{ shape: "rect", flex: 2 }, { shape: "rect", flex: 1 }] },
  { label: "Diagonale D", icon: "◢⬜", cols: 2, panels: [{ shape: "diag-right", flex: 1 }, { shape: "rect", flex: 1 }] },
  { label: "Diagonale G", icon: "⬜◣", cols: 2, panels: [{ shape: "rect", flex: 1 }, { shape: "diag-left", flex: 1 }] },
  { label: "Carré + grand", icon: "▪▬", cols: 2, panels: [{ shape: "small-square", flex: 1 }, { shape: "rect", flex: 2 }] },
];

const BUBBLE_SHAPES: { shape: BubbleShape; label: string; icon: string }[] = [
  { shape: "round", label: "Ronde", icon: "💬" },
  { shape: "rect", label: "Rectangle", icon: "🗨️" },
  { shape: "explosion", label: "Explosive", icon: "💥" },
  { shape: "thought", label: "Pensée", icon: "💭" },
  { shape: "shout", label: "Cri", icon: "📢" },
];

const RESP_COLORS = [
  { label: "Noir", color: "#000000" },
  { label: "Blanc", color: "#ffffff" },
  { label: "Rouge", color: "#c0392b" },
  { label: "Bleu nuit", color: "#0a0f1f" },
  { label: "Gris", color: "#1a1a1a" },
];

const uid = () => Math.random().toString(36).slice(2, 8);

// ── COMPOSANT BULLE SVG ──
function BubbleSVG({ shape, text, fontSize, color, bgColor }: { shape: BubbleShape; text: string; fontSize: number; color: string; bgColor: string }) {
  if (shape === "round") return (
    <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="55" rx="95" ry="45" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <polygon points="60,95 80,100 70,115" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <text x="100" y="60" textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill={color === "#ffffff" ? "#000" : color} fontFamily="'Bebas Neue', sans-serif" fontWeight="bold">{text}</text>
    </svg>
  );
  if (shape === "rect") return (
    <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
      <rect x="5" y="5" width="190" height="90" rx="4" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <polygon points="70,95 90,100 80,115" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <text x="100" y="52" textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill={color === "#ffffff" ? "#000" : color} fontFamily="'Bebas Neue', sans-serif">{text}</text>
    </svg>
  );
  if (shape === "explosion") return (
    <svg viewBox="0 0 200 140" style={{ width: "100%", height: "100%" }}>
      <polygon points="100,5 120,45 165,20 145,60 195,65 155,90 175,130 130,110 120,140 100,105 80,140 70,110 25,130 45,90 5,65 55,60 35,20 85,45" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <text x="100" y="75" textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill={color === "#ffffff" ? "#000" : color} fontFamily="'Bebas Neue', sans-serif" fontWeight="bold">{text}</text>
    </svg>
  );
  if (shape === "thought") return (
    <svg viewBox="0 0 200 130" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="55" rx="90" ry="42" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <circle cx="75" cy="105" r="10" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <circle cx="60" cy="118" r="6" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <circle cx="48" cy="127" r="4" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <text x="100" y="58" textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill={color === "#ffffff" ? "#000" : color} fontFamily="Georgia, serif" fontStyle="italic">{text}</text>
    </svg>
  );
  // shout
  return (
    <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
      <rect x="5" y="5" width="190" height="80" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="3"/>
      <line x1="5" y1="5" x2="195" y2="85" stroke={color === "#ffffff" ? "#000" : color} strokeWidth="1" opacity="0.3"/>
      <line x1="195" y1="5" x2="5" y2="85" stroke={color === "#ffffff" ? "#000" : color} strokeWidth="1" opacity="0.3"/>
      <polygon points="85,85 105,85 95,110" fill={bgColor} stroke={color === "#ffffff" ? "#000" : color} strokeWidth="2"/>
      <text x="100" y="48" textAnchor="middle" dominantBaseline="middle" fontSize={fontSize + 2} fill={color === "#ffffff" ? "#000" : color} fontFamily="'Bebas Neue', sans-serif" fontWeight="bold" letterSpacing="2">{text}</text>
    </svg>
  );
}

// ── COMPOSANT PANEL ──
function PanelComp({ panel, onImageDrop, selected, onClick }: {
  panel: Panel;
  onImageDrop: (id: string, src: string) => void;
  selected: boolean;
  onClick: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      onImageDrop(panel.id, url);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageDrop(panel.id, url);
    }
  };

  const clipPath = panel.shape === "diag-right"
    ? "polygon(0 0, 100% 0, 85% 100%, 0% 100%)"
    : panel.shape === "diag-left"
    ? "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)"
    : "none";

  return (
    <div
      onClick={onClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        flex: panel.flex,
        minHeight: panel.shape === "small-square" ? "120px" : "200px",
        background: panel.image ? `url(${panel.image}) center/cover` : "#f8fafc",
        border: selected ? "2px solid #4a90d9" : "1px solid #e2e8f0",
        cursor: "pointer",
        position: "relative",
        clipPath,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {!panel.image && (
        <div style={{ textAlign: "center", color: "#cbd5e1", pointerEvents: "none" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🖼️</div>
          <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Déposer image</div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {selected && (
        <button
          onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
          style={{
            position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
            background: "#4a90d9", color: "white", border: "none",
            fontSize: "10px", fontWeight: 700, letterSpacing: "1px",
            padding: "5px 14px", cursor: "pointer", textTransform: "uppercase",
          }}
        >
          Choisir image
        </button>
      )}
    </div>
  );
}

// ── PAGE PRINCIPALE ──
export default function StudioPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBubbleShape, setSelectedBubbleShape] = useState<BubbleShape>("round");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [editingBubble, setEditingBubble] = useState<string | null>(null);
  const [bubbleText, setBubbleText] = useState("Texte...");
  const [bubbleFontSize, setBubbleFontSize] = useState(14);
  const [bubbleBg, setBubbleBg] = useState("#ffffff");
  const [bubbleColor, setBubbleColor] = useState("#000000");
  const [respColor, setRespColor] = useState("#000000");
  const [titre, setTitre] = useState("Épisode 1");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Charger épisode existant
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setEpisodeId(data.id);
        setTitre(data.titre);
        setBlocks(data.blocks || []);
        setBubbles(data.bubbles || []);
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
    setSaveMsg("✅ Sauvegardé !");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }, [blocks, bubbles, titre, episodeId]);

  // Ajouter un layout
  const addRow = (layout: typeof LAYOUTS[0]) => {
    const row: Row = {
      id: uid(),
      cols: layout.cols,
      panels: layout.panels.map((p) => ({ id: uid(), shape: p.shape, flex: p.flex })),
    };
    setBlocks((b) => [...b, { type: "row", data: row }]);
  };

  // Ajouter respiration
  const addResp = () => {
    const resp: Respiration = { id: uid(), color: respColor, height: 40 };
    setBlocks((b) => [...b, { type: "respiration", data: resp }]);
  };

  // Image dans panel
  const handleImageDrop = (panelId: string, src: string) => {
    setBlocks((prev) => prev.map((block) => {
      if (block.type !== "row") return block;
      return {
        ...block,
        data: {
          ...block.data,
          panels: block.data.panels.map((p: Panel) => p.id === panelId ? { ...p, image: src } : p),
        },
      };
    }));
  };

  // Ajouter bulle sur le canvas
  const addBubble = () => {
    const b: Bubble = {
      id: uid(),
      shape: selectedBubbleShape,
      text: bubbleText,
      x: 60, y: 100,
      width: 160, height: 100,
      fontSize: bubbleFontSize,
      color: bubbleColor,
      bgColor: bubbleBg,
    };
    setBubbles((prev) => [...prev, b]);
    setSelectedBubble(b.id);
  };

  // Drag bulle
  const handleBubbleDrag = (id: string, dx: number, dy: number) => {
    setBubbles((prev) => prev.map((b) => b.id === id ? { ...b, x: b.x + dx, y: b.y + dy } : b));
  };

  // Supprimer bloc
  const deleteBlock = (id: string) => setBlocks((b) => b.filter((bl) => bl.type === "row" ? bl.data.id !== id : bl.data.id !== id));
  const deleteBubble = (id: string) => setBubbles((b) => b.filter((bu) => bu.id !== id));

  // Générer épisode auto
  const generateEpisode = () => {
    const template: Block[] = [
      { type: "row", data: { id: uid(), cols: 1, panels: [{ id: uid(), shape: "full", flex: 1 }] } },
      { type: "respiration", data: { id: uid(), color: "#000000", height: 40 } },
      { type: "row", data: { id: uid(), cols: 2, panels: [{ id: uid(), shape: "rect", flex: 2 }, { id: uid(), shape: "rect", flex: 1 }] } },
      { type: "row", data: { id: uid(), cols: 3, panels: [{ id: uid(), shape: "rect", flex: 1 }, { id: uid(), shape: "rect", flex: 1 }, { id: uid(), shape: "rect", flex: 1 }] } },
      { type: "respiration", data: { id: uid(), color: "#ffffff", height: 40 } },
      { type: "row", data: { id: uid(), cols: 2, panels: [{ id: uid(), shape: "diag-right", flex: 1 }, { id: uid(), shape: "rect", flex: 1 }] } },
      { type: "respiration", data: { id: uid(), color: "#000000", height: 40 } },
      { type: "row", data: { id: uid(), cols: 1, panels: [{ id: uid(), shape: "full", flex: 1 }] } },
      { type: "respiration", data: { id: uid(), color: "#c0392b", height: 40 } },
      { type: "row", data: { id: uid(), cols: 2, panels: [{ id: uid(), shape: "small-square", flex: 1 }, { id: uid(), shape: "rect", flex: 2 }] } },
    ];
    setBlocks(template);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5", color: "#1a1a2e", fontFamily: "var(--font-rajdhani, 'Rajdhani', sans-serif)" }}>

      {/* ── SIDEBAR GAUCHE ── */}
      <div style={{
        width: "240px", flexShrink: 0,
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column",
        padding: "16px 12px",
        gap: "24px",
        overflowY: "auto",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "20px", letterSpacing: "4px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", color: "#1a1a2e" }}>
          MANO<span style={{ color: "#4a90d9" }}>STUDIO</span>
        </div>

        {/* Générer auto */}
        <div>
          <div style={labelStyle}>✦ Générer épisode</div>
          <button onClick={generateEpisode} style={btnRedStyle}>
            ⚡ Générer automatiquement
          </button>
        </div>

        {/* Layouts */}
        <div>
          <div style={labelStyle}>📐 Ajouter un layout</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {LAYOUTS.map((l, i) => (
              <button key={i} onClick={() => addRow(l)} style={btnDarkStyle}>
                <span style={{ marginRight: "8px", fontSize: "12px" }}>{l.icon}</span>{l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Respiration */}
        <div>
          <div style={labelStyle}>⬛ Espace de respiration</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
            {RESP_COLORS.map((c) => (
              <button key={c.color} onClick={() => setRespColor(c.color)} style={{
                width: "28px", height: "28px", borderRadius: "2px",
                background: c.color,
                border: respColor === c.color ? "2px solid #c0392b" : "1px solid #333",
                cursor: "pointer",
              }} title={c.label} />
            ))}
            <input type="color" value={respColor} onChange={(e) => setRespColor(e.target.value)}
              style={{ width: "28px", height: "28px", border: "1px solid #333", background: "none", cursor: "pointer", padding: 0 }} />
          </div>
          <button onClick={addResp} style={btnDarkStyle}>+ Ajouter respiration</button>
        </div>

        {/* Bulles */}
        <div>
          <div style={labelStyle}>💬 Bulles de dialogue</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
            {BUBBLE_SHAPES.map((bs) => (
              <button key={bs.shape} onClick={() => setSelectedBubbleShape(bs.shape)} title={bs.label} style={{
                width: "40px", height: "40px", fontSize: "18px",
                background: selectedBubbleShape === bs.shape ? "rgba(74,144,217,0.15)" : "#f8fafc",
                border: selectedBubbleShape === bs.shape ? "1px solid #4a90d9" : "1px solid #e2e8f0",
                cursor: "pointer", borderRadius: "2px",
              }}>{bs.icon}</button>
            ))}
          </div>
          <input
            value={bubbleText}
            onChange={(e) => setBubbleText(e.target.value)}
            placeholder="Texte de la bulle..."
            style={{ ...inputStyle, marginBottom: "6px" }}
          />
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
            <label style={{ fontSize: "10px", color: "#555", letterSpacing: "1px" }}>Taille</label>
            <input type="range" min="10" max="28" value={bubbleFontSize} onChange={(e) => setBubbleFontSize(Number(e.target.value))}
              style={{ flex: 1 }} />
            <span style={{ fontSize: "11px", color: "#888", width: "24px" }}>{bubbleFontSize}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "9px", color: "#555", marginBottom: "3px" }}>Fond</div>
              <input type="color" value={bubbleBg} onChange={(e) => setBubbleBg(e.target.value)}
                style={{ width: "36px", height: "28px", border: "1px solid #333", cursor: "pointer", padding: 0 }} />
            </div>
            <div>
              <div style={{ fontSize: "9px", color: "#555", marginBottom: "3px" }}>Texte</div>
              <input type="color" value={bubbleColor} onChange={(e) => setBubbleColor(e.target.value)}
                style={{ width: "36px", height: "28px", border: "1px solid #333", cursor: "pointer", padding: 0 }} />
            </div>
          </div>
          <button onClick={addBubble} style={btnRedStyle}>+ Ajouter bulle</button>
        </div>

        {/* Supprimer sélection */}
        {(selectedPanel || selectedBubble) && (
          <button onClick={() => {
            if (selectedBubble) { deleteBubble(selectedBubble); setSelectedBubble(null); }
            if (selectedPanel) { deleteBlock(selectedPanel); setSelectedPanel(null); }
          }} style={{ ...btnDarkStyle, borderColor: "#c0392b", color: "#c0392b" }}>
            🗑 Supprimer
          </button>
        )}
      </div>

      {/* ── CANVAS CENTRAL ── */}
      <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 80px", background: "#f0f2f5" }}>

        <div style={{ width: "100%", maxWidth: preview ? "400px" : "600px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "24px", letterSpacing: "3px", color: "#1a1a2e", border: "none", background: "transparent", outline: "none", flex: 1 }}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {saveMsg && <span style={{ fontSize: "11px", color: "#4a90d9" }}>{saveMsg}</span>}
            <button onClick={() => setPreview(!preview)} style={{
              padding: "8px 16px", background: preview ? "#4a90d9" : "#f0f2f5",
              border: "1px solid #e2e8f0", color: preview ? "white" : "#64748b",
              fontSize: "11px", fontWeight: 700, cursor: "pointer", borderRadius: "4px", letterSpacing: "1px",
            }}>
              {preview ? "✏️ Éditer" : "👁 Aperçu"}
            </button>
            <button onClick={save} disabled={saving} style={{
              padding: "8px 16px", background: "#4a90d9", border: "none",
              color: "white", fontSize: "11px", fontWeight: 700,
              cursor: "pointer", borderRadius: "4px", letterSpacing: "1px",
            }}>
              {saving ? "..." : "💾 Sauvegarder"}
            </button>
            <a href="/" style={{ fontSize: "11px", color: "#94a3b8", letterSpacing: "2px", textDecoration: "none" }}>← Retour</a>
          </div>
        </div>

        {/* MODE PREVIEW WEBTOON */}
        {preview && (
          <div style={{ width: "100%", maxWidth: "400px", background: "#000", borderRadius: "8px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "12px 16px", background: "#111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)", fontSize: "14px", letterSpacing: "3px", color: "#f0eff8" }}>APERÇU WEBTOON</span>
              <span style={{ fontSize: "10px", color: "#555", letterSpacing: "1px" }}>MOBILE · 9:16</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {blocks.map((block) => {
                if (block.type === "respiration") {
                  const resp = block.data as Respiration;
                  return <div key={resp.id} style={{ width: "100%", height: `${resp.height}px`, background: resp.color }} />;
                }
                const row = block.data as Row;
                return (
                  <div key={row.id} style={{ display: "flex", width: "100%", minHeight: "160px", gap: "1px" }}>
                    {row.panels.map((panel: Panel) => (
                      <div key={panel.id} style={{
                        flex: panel.flex,
                        background: panel.image ? `url(${panel.image}) center/cover` : "#1a1a1a",
                        minHeight: "160px",
                        clipPath: panel.shape === "diag-right" ? "polygon(0 0, 100% 0, 85% 100%, 0% 100%)"
                          : panel.shape === "diag-left" ? "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" : "none",
                      }}>
                        {!panel.image && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#333", fontSize: "20px" }}>🖼️</div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {blocks.length === 0 && (
          <div style={{
            width: "100%", maxWidth: "600px", height: "300px",
            border: "2px dashed #cbd5e1", display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "16px", color: "#94a3b8", background: "#fff", borderRadius: "8px",
          }}>
            <div style={{ fontSize: "40px" }}>🎨</div>
            <div style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>
              Ajoute un layout ou génère un épisode
            </div>
          </div>
        )}

        {/* Canvas avec bulles */}
        <div ref={canvasRef} style={{ width: "100%", maxWidth: "600px", position: "relative" }}>

          {/* Blocs */}
          {blocks.map((block) => {
            if (block.type === "respiration") {
              const resp = block.data as Respiration;
              return (
                <div key={resp.id} onClick={() => setSelectedPanel(resp.id)}
                  style={{
                    width: "100%", height: `${resp.height}px`,
                    background: resp.color,
                    border: selectedPanel === resp.id ? "2px solid #c0392b" : "none",
                    cursor: "pointer", position: "relative",
                  }}>
                  {selectedPanel === resp.id && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      {RESP_COLORS.map((c) => (
                        <button key={c.color} onClick={(e) => {
                          e.stopPropagation();
                          setBlocks((prev) => prev.map((b) => b.type === "respiration" && b.data.id === resp.id
                            ? { ...b, data: { ...b.data, color: c.color } } : b));
                        }} style={{
                          width: "20px", height: "20px", background: c.color,
                          border: resp.color === c.color ? "2px solid #c0392b" : "1px solid #555",
                          cursor: "pointer", borderRadius: "2px",
                        }} />
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); deleteBlock(resp.id); setSelectedPanel(null); }}
                        style={{ fontSize: "12px", background: "none", border: "none", color: "#c0392b", cursor: "pointer" }}>🗑</button>
                    </div>
                  )}
                </div>
              );
            }

            const row = block.data as Row;
            return (
              <div key={row.id} style={{ display: "flex", width: "100%", minHeight: "200px", gap: "2px" }}>
                {row.panels.map((panel) => (
                  <PanelComp
                    key={panel.id}
                    panel={panel}
                    onImageDrop={handleImageDrop}
                    selected={selectedPanel === panel.id}
                    onClick={() => setSelectedPanel(panel.id === selectedPanel ? null : panel.id)}
                  />
                ))}
              </div>
            );
          })}

          {/* Bulles flottantes */}
          {bubbles.map((bubble) => (
            <BubbleEl
              key={bubble.id}
              bubble={bubble}
              selected={selectedBubble === bubble.id}
              editing={editingBubble === bubble.id}
              onSelect={() => setSelectedBubble(bubble.id === selectedBubble ? null : bubble.id)}
              onDrag={(dx, dy) => handleBubbleDrag(bubble.id, dx, dy)}
              onEdit={() => setEditingBubble(bubble.id)}
              onTextChange={(t) => setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, text: t } : b))}
              onStopEdit={() => setEditingBubble(null)}
              onDelete={() => { deleteBubble(bubble.id); setSelectedBubble(null); }}
              onResize={(dw, dh) => setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, width: Math.max(80, b.width + dw), height: Math.max(60, b.height + dh) } : b))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BULLE DRAGGABLE ──
function BubbleEl({ bubble, selected, editing, onSelect, onDrag, onEdit, onTextChange, onStopEdit, onDelete, onResize }: {
  bubble: Bubble;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onDrag: (dx: number, dy: number) => void;
  onEdit: () => void;
  onTextChange: (t: string) => void;
  onStopEdit: () => void;
  onDelete: () => void;
  onResize: (dw: number, dh: number) => void;
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
    const up = () => {
      dragStart.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY };
    const move = (ev: MouseEvent) => onResize(ev.clientX - start.x, ev.clientY - start.y);
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit(); }}
      style={{
        position: "absolute",
        left: bubble.x, top: bubble.y,
        width: bubble.width, height: bubble.height,
        cursor: "move", userSelect: "none",
        outline: selected ? "2px dashed #c0392b" : "none",
        zIndex: 10,
      }}
    >
      {editing ? (
        <textarea
          autoFocus
          value={bubble.text}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onStopEdit}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.8)", color: "white", border: "none",
            fontSize: `${bubble.fontSize}px`, textAlign: "center", padding: "8px",
            resize: "none", zIndex: 20,
          }}
        />
      ) : (
        <BubbleSVG shape={bubble.shape} text={bubble.text} fontSize={bubble.fontSize} color={bubble.bgColor} bgColor={bubble.bgColor} />
      )}

      {selected && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ position: "absolute", top: -10, right: -10, width: "20px", height: "20px", background: "#c0392b", border: "none", color: "white", cursor: "pointer", fontSize: "11px", borderRadius: "50%", zIndex: 20 }}>
            ×
          </button>
          <div onMouseDown={handleResizeDown}
            style={{ position: "absolute", bottom: -4, right: -4, width: "12px", height: "12px", background: "#c0392b", cursor: "se-resize", zIndex: 20 }} />
        </>
      )}
    </div>
  );
}

// ── STYLES UTILITAIRES ──
const labelStyle: React.CSSProperties = {
  fontSize: "9px", fontWeight: 700, letterSpacing: "2px",
  textTransform: "uppercase", color: "#4a90d9", marginBottom: "8px",
};
const btnDarkStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", background: "#f8fafc",
  border: "1px solid #e2e8f0", color: "#64748b",
  fontSize: "11px", fontWeight: 600, letterSpacing: "1px",
  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
  marginBottom: "2px", borderRadius: "4px",
};
const btnRedStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "#4a90d9",
  border: "none", color: "white",
  fontSize: "11px", fontWeight: 700, letterSpacing: "1px",
  cursor: "pointer", textTransform: "uppercase", marginBottom: "4px",
  borderRadius: "4px",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px", background: "#f8fafc",
  border: "1px solid #e2e8f0", color: "#1a1a2e",
  fontSize: "12px", outline: "none", borderRadius: "4px",
};
