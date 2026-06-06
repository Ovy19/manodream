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
            radial-gradient(ellipse at 30% 40%, rgba(192,57,43,0.25) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 60%, rgba(231,76,60,0.1) 0%, transparent 50%),
            linear-gradient(160deg, #0f0a14 0%, #0a0a0f 40%, #100a0a 100%);
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
        <div className="hero-lines" />
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
