import Link from "next/link";

const MANGAS = [
  {
    slug: "primo-burst",
    titre: "Primo Burst",
    auteur: "OVY",
    genres: ["Action", "Fantastique", "Aventure"],
    statut: "En cours",
    chapitres: 1,
    description: "Dans un monde où les Primordiaux façonnèrent les montagnes et ouvrirent les mers, un héritage renaît de leurs cendres — les Yokonji.",
    cover: "/planches/ch1-p1.png",
    couleur: "#c0392b",
  },
  // Bientôt d'autres mangas...
];

export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 52px;
          background: rgba(6,6,10,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-logo {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 4px;
          color: #f0eff8; text-decoration: none;
        }
        .nav-logo span { color: #c0392b; }
        .nav-conn {
          font-family: var(--font-rajdhani), sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; padding: 5px 14px;
          border: 1px solid rgba(192,57,43,0.4); color: #8b8b9a;
          text-decoration: none; transition: all 0.2s;
        }
        .nav-conn:hover { border-color: #c0392b; color: #f0eff8; }

        /* ── HERO PLATEFORME ── */
        .hero {
          position: relative;
          height: calc(100vh - 52px);
          margin-top: 52px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden; text-align: center;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 50% 20%, rgba(140,180,255,0.1) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 70%, rgba(192,57,43,0.12) 0%, transparent 50%),
            linear-gradient(180deg, #03060f 0%, #06060a 60%, #0a0608 100%);
        }
        .hero-stars {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 8%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 20%, rgba(200,220,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 5%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 12%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 28%, rgba(200,220,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 18%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 78% 35%, rgba(200,220,255,0.4) 0%, transparent 100%);
          pointer-events: none;
        }
        .hero-moon {
          position: absolute; top: 12%; left: 50%; transform: translateX(-50%);
          width: 70px; height: 70px; border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #e8f0ff 0%, #b8d0ff 40%, #7aa0e8 100%);
          box-shadow: 0 0 40px rgba(140,180,255,0.5), 0 0 80px rgba(140,180,255,0.2);
          animation: moonGlow 4s ease-in-out infinite;
        }
        @keyframes moonGlow {
          0%,100% { box-shadow: 0 0 40px rgba(140,180,255,0.5), 0 0 80px rgba(140,180,255,0.2); }
          50% { box-shadow: 0 0 60px rgba(140,180,255,0.7), 0 0 120px rgba(140,180,255,0.3); }
        }
        /* Skyline */
        .hero-city {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 45%; pointer-events: none;
        }
        .hero-content {
          position: relative; z-index: 2;
          padding: 0 20px;
        }
        .hero-tag {
          display: inline-block; font-size: 10px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          color: #8b8b9a; margin-bottom: 20px;
        }
        .hero-title {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 14vw, 100px);
          line-height: 0.9; letter-spacing: 6px;
          color: #f0eff8;
          text-shadow: 0 0 80px rgba(140,180,255,0.2);
          margin-bottom: 6px;
        }
        .hero-title span { color: #c0392b; }
        .hero-subtitle {
          font-size: 12px; letter-spacing: 3px;
          color: #444; text-transform: uppercase; margin-bottom: 40px;
        }
        .hero-cta {
          display: inline-block;
          font-family: var(--font-rajdhani), sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; padding: 12px 32px;
          background: #c0392b; color: white;
          text-decoration: none;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: all 0.3s;
        }
        .hero-cta:hover { background: #e74c3c; transform: translateY(-2px); }
        .scroll-hint {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: #333; font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          animation: bounce 2s ease-in-out infinite;
        }
        .scroll-hint::after { content: ''; width: 1px; height: 24px; background: linear-gradient(#c0392b, transparent); }
        @keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(6px); } }

        /* ── CATALOGUE ── */
        .catalogue {
          padding: 60px 24px;
          max-width: 1100px; margin: 0 auto;
        }
        .section-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .section-title {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 3px; color: #f0eff8;
        }
        .divider { height: 1px; background: linear-gradient(to right, #c0392b, transparent); margin-bottom: 32px; }

        /* Grille mangas */
        .manga-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 24px;
        }

        /* Card manga */
        .manga-card {
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          cursor: pointer;
          transition: transform 0.3s;
        }
        .manga-card:hover { transform: translateY(-6px); }
        .manga-card:hover .manga-cover-overlay { opacity: 1; }

        .manga-cover {
          position: relative; width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          border-radius: 4px;
          background: linear-gradient(135deg, #1a0f0f, #0f0a18);
          margin-bottom: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .manga-cover img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: top;
          display: block;
        }
        .manga-cover-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
        }
        .manga-cover-btn {
          font-family: var(--font-rajdhani), sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; padding: 10px 20px;
          background: #c0392b; color: white;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
        }
        .manga-statut {
          position: absolute; top: 10px; left: 10px;
          font-size: 9px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; padding: 3px 8px;
          background: rgba(192,57,43,0.9); color: white;
          border-radius: 2px;
        }
        .manga-info {}
        .manga-titre {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 2px; color: #f0eff8;
          margin-bottom: 4px;
        }
        .manga-auteur { font-size: 11px; color: #555; margin-bottom: 6px; letter-spacing: 1px; }
        .manga-genres { display: flex; flex-wrap: wrap; gap: 6px; }
        .manga-genre {
          font-size: 10px; font-weight: 700; letter-spacing: 1px;
          padding: 2px 8px;
          border: 1px solid rgba(192,57,43,0.3);
          color: #c0392b; text-transform: uppercase;
        }

        /* Card "Bientôt" */
        .manga-card-soon .manga-cover {
          background: linear-gradient(135deg, #0f0f18, #0a0a12);
          border: 1px solid rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
        }
        .soon-label {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 16px; letter-spacing: 3px; color: #222;
          text-transform: uppercase;
        }

        /* Footer */
        footer {
          padding: 32px 24px; text-align: center;
          border-top: 1px solid rgba(255,255,255,0.03);
        }
        footer p { font-size: 11px; color: #222; letter-spacing: 2px; }

        /* Responsive */
        @media (max-width: 640px) {
          .manga-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .hero-title { letter-spacing: 4px; }
        }
        @media (max-width: 380px) {
          .manga-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a className="nav-logo" href="/">MANO<span>DREAM</span></a>
        <a href="/studio" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", color: "#c0392b", textDecoration: "none", padding: "6px 14px", border: "1px solid rgba(192,57,43,0.4)", borderRadius: "3px" }}>✏️ STUDIO</a>
        <a className="nav-conn" href="/connexion">Connexion</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-stars" />
        <div className="hero-moon" />

        {/* Skyline */}
        <div className="hero-city">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" style={{position:"absolute",bottom:0,width:"100%",height:"100%"}}>
            <g fill="#0a0f1f" opacity="0.9">
              <rect x="0" y="140" width="60" height="180"/><rect x="55" y="100" width="45" height="220"/>
              <rect x="95" y="160" width="30" height="160"/><rect x="120" y="60" width="55" height="260"/>
              <rect x="170" y="120" width="40" height="200"/><rect x="205" y="80" width="70" height="240"/>
              <rect x="270" y="140" width="35" height="180"/><rect x="300" y="40" width="50" height="280"/>
              <rect x="345" y="110" width="65" height="210"/><rect x="405" y="70" width="40" height="250"/>
              <rect x="440" y="130" width="55" height="190"/><rect x="490" y="50" width="60" height="270"/>
              <rect x="545" y="120" width="35" height="200"/><rect x="575" y="90" width="70" height="230"/>
              <rect x="640" y="150" width="40" height="170"/><rect x="675" y="30" width="55" height="290"/>
              <rect x="725" y="100" width="45" height="220"/><rect x="765" y="60" width="65" height="260"/>
              <rect x="825" y="130" width="40" height="190"/><rect x="860" y="80" width="55" height="240"/>
              <rect x="910" y="40" width="60" height="280"/><rect x="965" y="110" width="50" height="210"/>
              <rect x="1010" y="70" width="70" height="250"/><rect x="1075" y="140" width="35" height="180"/>
              <rect x="1105" y="90" width="55" height="230"/><rect x="1155" y="50" width="65" height="270"/>
              <rect x="1215" y="120" width="40" height="200"/><rect x="1250" y="60" width="60" height="260"/>
              <rect x="1305" y="100" width="50" height="220"/><rect x="1350" y="140" width="90" height="180"/>
            </g>
            <g fill="#060810">
              <rect x="0" y="210" width="80" height="110"/><rect x="75" y="190" width="55" height="130"/>
              <rect x="125" y="220" width="70" height="100"/><rect x="190" y="195" width="90" height="125"/>
              <rect x="275" y="215" width="60" height="105"/><rect x="330" y="175" width="80" height="145"/>
              <rect x="405" y="210" width="65" height="110"/><rect x="465" y="190" width="95" height="130"/>
              <rect x="555" y="200" width="70" height="120"/><rect x="620" y="225" width="55" height="95"/>
              <rect x="670" y="180" width="85" height="140"/><rect x="750" y="215" width="65" height="105"/>
              <rect x="810" y="195" width="90" height="125"/><rect x="895" y="220" width="60" height="100"/>
              <rect x="950" y="185" width="80" height="135"/><rect x="1025" y="205" width="75" height="115"/>
              <rect x="1095" y="218" width="65" height="102"/><rect x="1155" y="188" width="90" height="132"/>
              <rect x="1240" y="210" width="70" height="110"/><rect x="1305" y="195" width="135" height="125"/>
            </g>
            <rect x="0" y="318" width="1440" height="2" fill="rgba(140,180,255,0.06)"/>
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-tag">✦ Plateforme Webtoon Originale</div>
          <h1 className="hero-title">MANO<span>DREAM</span></h1>
          <p className="hero-subtitle">Des mondes à explorer — un chapitre à la fois</p>
          <a className="hero-cta" href="#catalogue">Découvrir les mangas</a>
        </div>

        <div className="scroll-hint">Scroll</div>
      </section>

      {/* CATALOGUE */}
      <section className="catalogue" id="catalogue">
        <div className="section-header">
          <h2 className="section-title">Catalogue</h2>
          <span style={{ fontSize: "11px", color: "#444", letterSpacing: "2px" }}>{MANGAS.length} série</span>
        </div>
        <div className="divider" />

        <div className="manga-grid">
          {MANGAS.map((manga) => (
            <Link key={manga.slug} href={`/manga/${manga.slug}`} className="manga-card">
              <div className="manga-cover">
                <img src={manga.cover} alt={manga.titre} />
                <div className="manga-statut">{manga.statut}</div>
                <div className="manga-cover-overlay">
                  <div className="manga-cover-btn">Lire</div>
                </div>
              </div>
              <div className="manga-info">
                <div className="manga-titre">{manga.titre}</div>
                <div className="manga-auteur">par {manga.auteur}</div>
                <div className="manga-genres">
                  {manga.genres.map((g) => <span key={g} className="manga-genre">{g}</span>)}
                </div>
              </div>
            </Link>
          ))}

          {/* Slots "Bientôt" */}
          {[1, 2].map((i) => (
            <div key={i} className="manga-card manga-card-soon">
              <div className="manga-cover">
                <div className="soon-label">Bientôt</div>
              </div>
              <div className="manga-info">
                <div className="manga-titre" style={{ color: "#222" }}>???</div>
                <div className="manga-auteur">En préparation</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>© 2026 MANODREAM — Tous droits réservés</p>
      </footer>
    </>
  );
}
