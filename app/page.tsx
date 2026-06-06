import Link from "next/link";

const EPISODES = [
  { num: 1, title: "L'Éveil du Rêveur", desc: "Chapitre d'introduction", icon: "⚔" },
  { num: 2, title: "Les Portes de l'Ombre", desc: "Le premier affrontement", icon: "🌑" },
  { num: 3, title: "Fragments de Mémoire", desc: "Les révélations", icon: "🔥" },
];

export default function Home() {
  return (
    <>
      <style>{`
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 52px;
          background: rgba(6,6,10,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(192,57,43,0.2);
        }
        .nav-logo {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 4px;
          color: var(--light);
          text-decoration: none;
        }
        .nav-logo span { color: var(--blood); }
        .nav-right { display: flex; gap: 10px; align-items: center; }
        .nav-btn {
          background: none;
          border: 1px solid rgba(192,57,43,0.5);
          color: var(--silver);
          font-family: var(--font-rajdhani), sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          padding: 5px 12px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .nav-btn:hover, .nav-btn.primary { background: var(--blood); color: white; border-color: var(--blood); }

        /* ── HERO ── */
        .hero {
          position: relative;
          height: calc(100vh - 52px);
          min-height: 500px;
          margin-top: 52px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 72% 18%, rgba(140,180,255,0.18) 0%, transparent 35%),
            radial-gradient(ellipse at 30% 40%, rgba(192,57,43,0.15) 0%, transparent 55%),
            linear-gradient(180deg, #03060f 0%, #060918 40%, #0a0a14 70%, #080608 100%);
        }
        /* Lune */
        .hero-moon {
          position: absolute;
          top: 10%; right: 22%;
          width: 90px; height: 90px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #e8f0ff 0%, #b8d0ff 40%, #7aa0e8 100%);
          box-shadow:
            0 0 40px rgba(140,180,255,0.6),
            0 0 80px rgba(140,180,255,0.3),
            0 0 160px rgba(140,180,255,0.15);
          animation: moonGlow 4s ease-in-out infinite;
        }
        .hero-moon::before {
          content: '';
          position: absolute;
          top: 12px; left: 18px;
          width: 22px; height: 20px;
          border-radius: 50%;
          background: rgba(100,140,220,0.25);
          box-shadow: 30px 8px 0 rgba(100,140,220,0.15), 10px 30px 0 rgba(100,140,220,0.1);
        }
        @keyframes moonGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(140,180,255,0.6), 0 0 80px rgba(140,180,255,0.3), 0 0 160px rgba(140,180,255,0.15); }
          50% { box-shadow: 0 0 60px rgba(140,180,255,0.8), 0 0 120px rgba(140,180,255,0.4), 0 0 200px rgba(140,180,255,0.2); }
        }
        /* Rayon de lune */
        .hero-moonray {
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: radial-gradient(ellipse at 72% 18%, rgba(140,180,255,0.08) 0%, transparent 55%);
          pointer-events: none;
        }
        /* City */
        .hero-city {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 55%;
          pointer-events: none;
        }
        /* Étoiles */
        .hero-stars {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 8%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 20%, rgba(200,220,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 5%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 15% 35%, rgba(200,220,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 12%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 28%, rgba(200,220,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 78% 22%, rgba(200,220,255,0.5) 0%, transparent 100%);
          pointer-events: none;
        }
        .hero-lines { position: absolute; inset: 0; overflow: hidden; }
        .hero-lines::before, .hero-lines::after {
          content: '';
          position: absolute;
          background: linear-gradient(var(--blood), transparent);
          opacity: 0.15;
          animation: linePulse 4s ease-in-out infinite;
        }
        .hero-lines::before { width: 1px; height: 60%; top: 0; left: 35%; transform: rotate(8deg); }
        .hero-lines::after { width: 1px; height: 45%; top: 15%; left: 65%; transform: rotate(-5deg); animation-delay: 2s; }
        @keyframes linePulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.35; }
        }
        .hero-silhouette {
          position: absolute; right: -10px; bottom: 0;
          width: 50%; max-width: 380px; height: 85%;
          display: flex; align-items: flex-end; justify-content: center;
          overflow: hidden;
          opacity: 0.8;
        }
        .silhouette-shape {
          width: 160px; height: 320px;
          background: linear-gradient(160deg, rgba(192,57,43,0.15) 0%, rgba(10,10,15,0.8) 60%);
          clip-path: polygon(50% 0%, 80% 15%, 95% 40%, 90% 70%, 70% 85%, 50% 100%, 30% 85%, 10% 70%, 5% 40%, 20% 15%);
          position: relative;
          animation: heroFloat 6s ease-in-out infinite;
        }
        .silhouette-shape::after {
          content: '⚔';
          position: absolute; top: 30%; left: 50%;
          transform: translateX(-50%);
          font-size: 52px; opacity: 0.12; color: var(--blood);
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .hero-content {
          position: relative; z-index: 2;
          padding: 0 20px 40px;
          max-width: 480px;
          animation: heroReveal 1s ease forwards;
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-tag {
          display: inline-block;
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: var(--blood);
          border: 1px solid var(--blood); padding: 3px 10px; margin-bottom: 12px;
        }
        .hero-title {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 16vw, 88px);
          line-height: 0.9; letter-spacing: 4px;
          color: var(--light);
          text-shadow: 0 0 60px rgba(192,57,43,0.4);
          margin-bottom: 6px;
        }
        .hero-title span { color: var(--blood); display: block; text-shadow: 0 0 80px rgba(192,57,43,0.6); }
        .hero-subtitle {
          font-size: 12px; font-weight: 400; letter-spacing: 2px;
          color: var(--ash); text-transform: uppercase; margin-bottom: 16px;
        }
        .hero-meta { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
        .hero-meta span { font-size: 12px; color: var(--ash); display: flex; align-items: center; gap: 5px; }
        .hero-meta span strong { color: var(--light); font-weight: 600; }
        .hero-cta { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn-primary {
          font-family: var(--font-rajdhani), sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; padding: 11px 22px;
          background: var(--blood); color: white; border: none;
          cursor: pointer; transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          text-decoration: none; display: inline-block;
        }
        .btn-primary:hover { background: var(--fire); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(192,57,43,0.4); }
        .btn-secondary {
          font-family: var(--font-rajdhani), sans-serif;
          font-size: 13px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; padding: 11px 20px;
          background: transparent; color: var(--silver);
          border: 1px solid rgba(200,200,216,0.25);
          cursor: pointer; transition: all 0.3s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          text-decoration: none; display: inline-block;
        }
        .btn-secondary:hover { border-color: var(--blood); color: var(--light); }

        .scroll-hint {
          position: absolute; bottom: 20px; right: 20px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: var(--ash); font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          animation: scrollBounce 2s ease-in-out infinite;
        }
        .scroll-hint::after { content: ''; width: 1px; height: 28px; background: linear-gradient(var(--blood), transparent); }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(6px); opacity: 1; }
        }

        /* ── ABOUT ── */
        .about-section {
          padding: 36px 20px;
          background: linear-gradient(to bottom, transparent, rgba(192,57,43,0.04), transparent);
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .about-inner {
          max-width: 700px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start;
        }
        .about-label { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: var(--blood); text-transform: uppercase; margin-bottom: 10px; }
        .about-text { font-size: 13px; line-height: 1.7; color: var(--ash); }
        .genre-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .genre-tag {
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          padding: 4px 12px; border: 1px solid rgba(192,57,43,0.4);
          color: var(--blood); text-transform: uppercase;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
        }

        /* ── EPISODES ── */
        .section { padding: 48px 20px; max-width: 700px; margin: 0 auto; }
        .section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .section-title { font-family: var(--font-bebas), 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 3px; color: var(--light); }
        .section-count { font-size: 11px; letter-spacing: 2px; color: var(--ash); text-transform: uppercase; }
        .divider { height: 1px; background: linear-gradient(to right, var(--blood), transparent); margin-bottom: 24px; }
        .episode-list { display: flex; flex-direction: column; gap: 2px; }
        .episode-card {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 14px;
          background: rgba(15,15,25,0.6);
          border: 1px solid rgba(255,255,255,0.04);
          border-left: 2px solid transparent;
          cursor: pointer; transition: all 0.25s;
          position: relative; overflow: hidden;
          text-decoration: none; color: inherit;
        }
        .episode-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(192,57,43,0.06), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .episode-card:hover { border-left-color: var(--blood); transform: translateX(4px); }
        .episode-card:hover::before { opacity: 1; }
        .episode-thumb {
          width: 56px; height: 42px; flex-shrink: 0;
          background: linear-gradient(135deg, #1a0f0f, #0f0a18);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: rgba(192,57,43,0.4); position: relative;
        }
        .episode-thumb::after { content: ''; position: absolute; inset: 0; border: 1px solid rgba(192,57,43,0.15); }
        .episode-info { flex: 1; min-width: 0; }
        .episode-num { font-size: 10px; font-weight: 700; letter-spacing: 2px; color: var(--blood); text-transform: uppercase; margin-bottom: 2px; }
        .episode-title-text { font-size: 14px; font-weight: 600; color: var(--light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .episode-date { font-size: 11px; color: var(--ash); margin-top: 2px; }
        .episode-action { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: var(--blood); text-transform: uppercase; flex-shrink: 0; }

        /* ── RESPONSIVE MOBILE ── */
        @media (max-width: 640px) {
          .about-inner { grid-template-columns: 1fr; gap: 20px; }
          .hero-silhouette { width: 40%; opacity: 0.5; }
          .hero-content { padding: 0 16px 36px; }
          .nav-btn:first-child { display: none; } /* cache "Accueil" sur mobile */
          .scroll-hint { display: none; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav>
        <a className="nav-logo" href="/">MANO<span>DREAM</span></a>
        <div className="nav-right">
          <a className="nav-btn" href="/">Accueil</a>
          <Link className="nav-btn primary" href="/lire/1">Lire</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-stars" />
        <div className="hero-moon" />
        <div className="hero-moonray" />
        <div className="hero-lines" />

        {/* City skyline SVG */}
        <div className="hero-city">
          <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" style={{position:"absolute",bottom:0,width:"100%",height:"100%"}}>
            {/* Bâtiments arrière-plan (bleutés) */}
            <g fill="#0a0f1f" opacity="0.9">
              <rect x="0" y="180" width="60" height="220"/>
              <rect x="55" y="140" width="45" height="260"/>
              <rect x="95" y="200" width="30" height="200"/>
              <rect x="120" y="100" width="55" height="300"/>
              <rect x="170" y="160" width="40" height="240"/>
              <rect x="205" y="120" width="70" height="280"/>
              <rect x="270" y="180" width="35" height="220"/>
              <rect x="300" y="80" width="50" height="320"/>
              <rect x="345" y="150" width="65" height="250"/>
              <rect x="405" y="110" width="40" height="290"/>
              <rect x="440" y="170" width="55" height="230"/>
              <rect x="490" y="90" width="60" height="310"/>
              <rect x="545" y="160" width="35" height="240"/>
              <rect x="575" y="130" width="70" height="270"/>
              <rect x="640" y="190" width="40" height="210"/>
              <rect x="675" y="70" width="55" height="330"/>
              <rect x="725" y="140" width="45" height="260"/>
              <rect x="765" y="100" width="65" height="300"/>
              <rect x="825" y="170" width="40" height="230"/>
              <rect x="860" y="120" width="55" height="280"/>
              <rect x="910" y="80" width="60" height="320"/>
              <rect x="965" y="150" width="50" height="250"/>
              <rect x="1010" y="110" width="70" height="290"/>
              <rect x="1075" y="180" width="35" height="220"/>
              <rect x="1105" y="130" width="55" height="270"/>
              <rect x="1155" y="90" width="65" height="310"/>
              <rect x="1215" y="160" width="40" height="240"/>
              <rect x="1250" y="100" width="60" height="300"/>
              <rect x="1305" y="140" width="50" height="260"/>
              <rect x="1350" y="180" width="90" height="220"/>
            </g>
            {/* Bâtiments premier plan (plus sombres) */}
            <g fill="#060810" opacity="1">
              <rect x="0" y="250" width="80" height="150"/>
              <rect x="75" y="220" width="55" height="180"/>
              <rect x="125" y="270" width="70" height="130"/>
              <rect x="190" y="230" width="90" height="170"/>
              <rect x="275" y="260" width="60" height="140"/>
              <rect x="330" y="200" width="80" height="200"/>
              <rect x="405" y="250" width="65" height="150"/>
              <rect x="465" y="220" width="95" height="180"/>
              <rect x="555" y="240" width="70" height="160"/>
              <rect x="620" y="270" width="55" height="130"/>
              <rect x="670" y="210" width="85" height="190"/>
              <rect x="750" y="255" width="65" height="145"/>
              <rect x="810" y="230" width="90" height="170"/>
              <rect x="895" y="265" width="60" height="135"/>
              <rect x="950" y="215" width="80" height="185"/>
              <rect x="1025" y="245" width="75" height="155"/>
              <rect x="1095" y="260" width="65" height="140"/>
              <rect x="1155" y="220" width="90" height="180"/>
              <rect x="1240" y="250" width="70" height="150"/>
              <rect x="1305" y="230" width="135" height="170"/>
            </g>
            {/* Fenêtres lumineuses (bleu lune) */}
            <g fill="rgba(140,180,255,0.15)">
              <rect x="128" y="115" width="6" height="8"/><rect x="140" y="115" width="6" height="8"/>
              <rect x="128" y="130" width="6" height="8"/><rect x="140" y="130" width="6" height="8"/>
              <rect x="308" y="95" width="6" height="8"/><rect x="320" y="95" width="6" height="8"/>
              <rect x="308" y="110" width="6" height="8"/>
              <rect x="502" y="105" width="6" height="8"/><rect x="514" y="105" width="6" height="8"/>
              <rect x="680" y="85" width="6" height="8"/><rect x="692" y="85" width="6" height="8"/>
              <rect x="680" y="100" width="6" height="8"/>
              <rect x="912" y="95" width="6" height="8"/><rect x="924" y="95" width="6" height="8"/>
              <rect x="912" y="110" width="6" height="8"/><rect x="924" y="110" width="6" height="8"/>
              <rect x="1158" y="105" width="6" height="8"/><rect x="1170" y="105" width="6" height="8"/>
              <rect x="1255" y="115" width="6" height="8"/><rect x="1267" y="115" width="6" height="8"/>
            </g>
            {/* Ligne de sol */}
            <rect x="0" y="398" width="1440" height="2" fill="rgba(140,180,255,0.1)"/>
          </svg>
        </div>

        <div className="hero-silhouette">
          <div className="silhouette-shape" />
        </div>
        <div className="hero-content">
          <div className="hero-tag">⚔ Webtoon Original</div>
          <h1 className="hero-title">
            Mano
            <span>Dream</span>
          </h1>
          <p className="hero-subtitle">Action · Fantastique · Aventure</p>
          <div className="hero-meta">
            <span>📖 <strong>3</strong> épisodes</span>
            <span>🔥 <strong>En cours</strong></span>
            <span>✍ <strong>OVY</strong></span>
          </div>
          <div className="hero-cta">
            <Link className="btn-primary" href="/lire/1">▶ Lire le Ep.1</Link>
            <a className="btn-secondary" href="#episodes">Tous les épisodes</a>
          </div>
        </div>
        <div className="scroll-hint">Scroll</div>
      </section>

      {/* ABOUT */}
      <div className="about-section">
        <div className="about-inner">
          <div>
            <div className="about-label">Synopsis</div>
            <p className="about-text">
              Dans un monde où les rêves deviennent des champs de bataille, un combattant solitaire découvre qu'il possède le pouvoir de façonner la réalité depuis le monde des songes. Mais chaque victoire a un prix...
            </p>
          </div>
          <div>
            <div className="about-label">Genres</div>
            <div className="genre-tags">
              <span className="genre-tag">Action</span>
              <span className="genre-tag">Fantastique</span>
              <span className="genre-tag">Aventure</span>
              <span className="genre-tag">Surnaturel</span>
            </div>
          </div>
        </div>
      </div>

      {/* EPISODE LIST */}
      <section className="section" id="episodes">
        <div className="section-header">
          <h2 className="section-title">Épisodes</h2>
          <span className="section-count">{EPISODES.length} chapitres</span>
        </div>
        <div className="divider" />
        <div className="episode-list">
          {EPISODES.map((ep) => (
            <Link key={ep.num} className="episode-card" href={`/lire/${ep.num}`}>
              <div className="episode-thumb">{ep.icon}</div>
              <div className="episode-info">
                <div className="episode-num">Épisode {ep.num}</div>
                <div className="episode-title-text">{ep.title}</div>
                <div className="episode-date">{ep.desc}</div>
              </div>
              <div className="episode-action">Lire →</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
