"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PinPage() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const SECRET = process.env.NEXT_PUBLIC_ACCESS_PIN || "1234";

  useEffect(() => {
    // Si déjà authentifié, redirige directement
    if (document.cookie.includes("md_auth=true")) {
      router.replace("/");
    }
    inputs.current[0]?.focus();
  }, [router]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;
    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);
    setError(false);

    if (val && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    // Vérification automatique quand les 4 chiffres sont saisis
    if (newPin.every((d) => d !== "") && val) {
      const code = newPin.join("");
      if (code === SECRET) {
        // Sauvegarder dans le cookie (24h)
        document.cookie = "md_auth=true; max-age=86400; path=/";
        router.replace("/");
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setPin(["", "", "", ""]);
          setShake(false);
          inputs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fond lune */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 20%, rgba(140,180,255,0.12) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "48px",
          letterSpacing: "8px",
          color: "#f0eff8",
          textShadow: "0 0 40px rgba(140,180,255,0.3)",
          marginBottom: "8px",
        }}>
          MANO<span style={{ color: "#c0392b" }}>DREAM</span>
        </h1>
        <p style={{ fontSize: "11px", letterSpacing: "3px", color: "#444", textTransform: "uppercase" }}>
          Accès privé
        </p>
      </div>

      {/* Lune déco */}
      <div style={{
        width: "60px", height: "60px", borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, #e8f0ff 0%, #b8d0ff 40%, #7aa0e8 100%)",
        boxShadow: "0 0 30px rgba(140,180,255,0.5), 0 0 60px rgba(140,180,255,0.2)",
        marginBottom: "40px",
      }} />

      {/* Code PIN */}
      <p style={{ fontSize: "12px", letterSpacing: "3px", color: "#555", textTransform: "uppercase", marginBottom: "24px" }}>
        Entrez votre code
      </p>

      <div
        style={{
          display: "flex",
          gap: "16px",
          animation: shake ? "shakePins 0.4s ease" : "none",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@600&display=swap');
          @keyframes shakePins {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
          .pin-input {
            width: 56px;
            height: 68px;
            background: rgba(15,15,25,0.8);
            border: 1px solid rgba(192,57,43,0.3);
            border-radius: 4px;
            text-align: center;
            font-size: 28px;
            font-weight: 700;
            color: #f0eff8;
            outline: none;
            transition: all 0.2s;
            caret-color: transparent;
            font-family: 'Rajdhani', sans-serif;
          }
          .pin-input:focus {
            border-color: rgba(140,180,255,0.6);
            box-shadow: 0 0 20px rgba(140,180,255,0.15);
            background: rgba(20,25,45,0.9);
          }
          .pin-input.error {
            border-color: rgba(192,57,43,0.8);
            box-shadow: 0 0 20px rgba(192,57,43,0.2);
          }
          @media (max-width: 400px) {
            .pin-input { width: 48px; height: 60px; font-size: 24px; }
          }
        `}</style>

        {pin.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            className={`pin-input${error ? " error" : ""}`}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>

      {error && (
        <p style={{
          marginTop: "20px",
          fontSize: "12px",
          letterSpacing: "2px",
          color: "#c0392b",
          textTransform: "uppercase",
        }}>
          Code incorrect
        </p>
      )}

      <p style={{
        position: "absolute", bottom: "24px",
        fontSize: "11px", color: "#1a1a1a", letterSpacing: "2px",
      }}>
        © 2026 MANODREAM
      </p>
    </div>
  );
}
