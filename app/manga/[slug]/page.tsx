import Link from "next/link";

const MANGAS: Record<string, {
  titre: string; auteur: string; genres: string[];
  statut: string; description: string; cover: string;
  chapitres: { num: number; titre: string; desc: string }[];
}> = {
  "primo-burst": {
    titre: "Primo Burst",
    auteur: "OVY",
    genres: ["Action", "Fantastique", "Aventure", "Surnaturel"],
    statut: "En cours",
    description: "Dans un monde où les Primordiaux façonnèrent les montagnes et ouvrirent les mers, un héritage renaît de leurs cendres — les Yokonji. Des bêtes mystiques. Des maîtres absolus. Jusqu'au jour du Primo Burst.",
    cover: "/planches/ch1-p1.png",
    chapitres: [
      { num: 1, titre: "L'Éveil", desc: "Le commencement" },
    ],
  },
};

export default async function MangaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manga = MANGAS[slug];

  if (!manga) {
    return (
      <div style={{ minHeight: "100vh", background: "#06060a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#c0392b", fontSize: "24px", marginBottom: "16px" }}>Manga introuvable</p>
          <Link href="/" style={{ color: "#555", fontSize: "13px" }}>← Retour</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; padding: 0 24px; height: 52px;
          background: rgba(6,6,10,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          gap: 16px;
        }
        .nav-back {
          font-family: var(--font-rajdhani), sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 2px;
          color: #555; text-decoration: none; text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-back:hover { color: #f0eff8; }
        .nav-logo {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 4px; color: #f0eff8; text-decoration: none;
        }
        .nav-logo span { color: #c0392b; }

        /* BANNER */
        .banner {
          position: relative; height: 360px; margin-top: 52px;
          overflow: hidden;
        }
        .banner-img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: top;
          filter: brightness(0.3);
        }
        .banner-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 30%, #06060a 100%);
        }
        .banner-content {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 0 32px 32px;
          display: flex; align-items: flex-end; gap: 24px;
        }
        .manga-cover-thumb {
          width: 110px; height: 150px; flex-shrink: 0;
          border-radius: 4px; overflow: hidden;
          border: 2px solid rgba(192,57,43,0.4);
          box-shadow: 0 8px 32px rgba(0,0,0,0.8);
        }
        .manga-cover-thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
        .manga-meta { flex: 1; }
        .manga-statut-badge {
          display: inline-block; font-size: 9px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; padding: 3px 10px; margin-bottom: 10px;
          background: rgba(192,57,43,0.9); color: white; border-radius: 2px;
        }
        .manga-titre {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: clamp(32px, 8vw, 56px); letter-spacing: 4px;
          color: #f0eff8; line-height: 1; margin-bottom: 6px;
        }
        .manga-auteur { font-size: 12px; color: #555; letter-spacing: 2px; margin-bottom: 10px; }
        .manga-genres { display: flex; flex-wrap: wrap; gap: 6px; }
        .genre-tag {
          font-size: 9px; font-weight: 700; letter-spacing: 1px;
          padding: 3px 8px; border: 1px solid rgba(192,57,43,0.3);
          color: #c0392b; text-transform: uppercase;
        }

        /* BODY */
        .manga-body { max-width: 800px; margin: 0 auto; padding: 40px 24px 80px; }

        .synopsis-label {
          font-size: 10px; font-weight: 700; letter-spacing: 3px;
          color: #c0392b; text-transform: uppercase; margin-bottom: 10px;
        }
        .synopsis-text { font-size: 14px; line-height: 1.8; color: #8b8b9a; margin-bottom: 40px; }

        .chapitres-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .chapitres-titre {
          font-family: var(--font-bebas), 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 3px; color: #f0eff8;
        }
        .divider { height: 1px; background: linear-gradient(to right, #c0392b, transparent); margin-bottom: 20px; }

        .chapitre-card {
          display: flex; align-items: center; gap: 16px;
          padding: 14px 16px;
          background: rgba(15,15,25,0.6);
          border: 1px solid rgba(255,255,255,0.04);
          border-left: 2px solid transparent;
          text-decoration: none; color: inherit;
          transition: all 0.25s; margin-bottom: 2px;
          position: relative; overflow: hidden;
        }
        .chapitre-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(192,57,43,0.06), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .chapitre-card:hover { border-left-color: #c0392b; transform: translateX(4px); }
        .chapitre-card:hover::before { opacity: 1; }
        .chap-num { font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #c0392b; text-transform: uppercase; margin-bottom: 3px; }
        .chap-titre { font-size: 15px; font-weight: 600; color: #f0eff8; }
        .chap-desc { font-size: 11px; color: #555; margin-top: 2px; }
        .chap-action { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #c0392b; margin-left: auto; flex-shrink: 0; }

        @media (max-width: 600px) {
          .banner { height: 280px; }
          .banner-content { padding: 0 16px 24px; gap: 16px; }
          .manga-cover-thumb { width: 80px; height: 110px; }
        }
      `}</style>

      <nav>
        <Link className="nav-back" href="/">← Retour</Link>
        <Link className="nav-logo" href="/">MANO<span>DREAM</span></Link>
      </nav>

      {/* BANNER */}
      <div className="banner">
        <img className="banner-img" src={manga.cover} alt={manga.titre} />
        <div className="banner-overlay" />
        <div className="banner-content">
          <div className="manga-cover-thumb">
            <img src={manga.cover} alt={manga.titre} />
          </div>
          <div className="manga-meta">
            <div className="manga-statut-badge">{manga.statut}</div>
            <div className="manga-titre">{manga.titre}</div>
            <div className="manga-auteur">par {manga.auteur}</div>
            <div className="manga-genres">
              {manga.genres.map((g) => <span key={g} className="genre-tag">{g}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="manga-body">
        <div className="synopsis-label">Synopsis</div>
        <p className="synopsis-text">{manga.description}</p>

        <div className="chapitres-header">
          <h2 className="chapitres-titre">Chapitres</h2>
          <span style={{ fontSize: "11px", color: "#444", letterSpacing: "2px" }}>{manga.chapitres.length} chapitre{manga.chapitres.length > 1 ? "s" : ""}</span>
        </div>
        <div className="divider" />

        {manga.chapitres.map((chap) => (
          <Link key={chap.num} href={`/lire/${chap.num}`} className="chapitre-card">
            <div>
              <div className="chap-num">Chapitre {chap.num}</div>
              <div className="chap-titre">{chap.titre}</div>
              <div className="chap-desc">{chap.desc}</div>
            </div>
            <div className="chap-action">Lire →</div>
          </Link>
        ))}
      </div>
    </>
  );
}
