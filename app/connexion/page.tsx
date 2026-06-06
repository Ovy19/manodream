"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("✅ Vérifie ton email pour confirmer ton compte !");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Récupère le rôle
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "createur") {
          router.push("/studio");
        } else {
          router.push("/");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#06060a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');

        body::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse at 50% 10%, rgba(140,180,255,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(192,57,43,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .conn-input {
          width: 100%; padding: 12px 16px;
          background: rgba(15,15,25,0.8);
          border: 1px solid #1a1a2a;
          color: #f0eff8; font-size: 14px;
          font-family: 'Rajdhani', sans-serif;
          outline: none; transition: border 0.2s;
          border-radius: 2px;
        }
        .conn-input:focus { border-color: rgba(192,57,43,0.5); }
        .conn-input::placeholder { color: #333; }

        .tab {
          flex: 1; padding: 10px;
          background: none; border: none;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }
        .tab.active { color: #f0eff8; border-bottom-color: #c0392b; }
        .tab:not(.active) { color: #333; }

        .btn-submit {
          width: 100%; padding: 14px;
          background: #c0392b; color: white; border: none;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .btn-submit:hover:not(:disabled) { background: #e74c3c; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Lune déco */}
      <div style={{
        width: "50px", height: "50px", borderRadius: "50%", marginBottom: "32px",
        background: "radial-gradient(circle at 40% 35%, #e8f0ff 0%, #b8d0ff 40%, #7aa0e8 100%)",
        boxShadow: "0 0 30px rgba(140,180,255,0.4), 0 0 60px rgba(140,180,255,0.15)",
      }} />

      {/* Logo */}
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "40px", letterSpacing: "6px",
        color: "#f0eff8", marginBottom: "4px",
        textShadow: "0 0 40px rgba(140,180,255,0.2)",
      }}>
        MANO<span style={{ color: "#c0392b" }}>DREAM</span>
      </h1>
      <p style={{ fontSize: "10px", letterSpacing: "3px", color: "#333", textTransform: "uppercase", marginBottom: "40px" }}>
        Plateforme Webtoon
      </p>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: "380px",
        background: "rgba(10,10,16,0.9)",
        border: "1px solid #1a1a2a",
        borderRadius: "4px", overflow: "hidden",
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1a1a2a" }}>
          <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
            Connexion
          </button>
          <button className={`tab ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>
            Inscription
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Email</div>
            <input
              className="conn-input"
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>Mot de passe</div>
            <input
              className="conn-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{
              fontSize: "12px", letterSpacing: "1px",
              color: error.startsWith("✅") ? "#2ecc71" : "#c0392b",
              textAlign: "center",
            }}>{error}</p>
          )}

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>

          {/* Info rôles */}
          {mode === "signup" && (
            <p style={{ fontSize: "11px", color: "#333", textAlign: "center", lineHeight: "1.6" }}>
              Ton compte sera créé en tant que <strong style={{ color: "#8b8b9a" }}>Lecteur</strong>.<br/>
              Le rôle Créateur est accordé manuellement.
            </p>
          )}
        </form>
      </div>

      {/* Retour */}
      <a href="/" style={{ marginTop: "24px", fontSize: "11px", color: "#333", letterSpacing: "2px", textDecoration: "none", textTransform: "uppercase" }}>
        ← Continuer sans compte
      </a>

      <p style={{ position: "absolute", bottom: "20px", fontSize: "10px", color: "#1a1a1a", letterSpacing: "2px" }}>
        © 2026 MANODREAM
      </p>
    </div>
  );
}
