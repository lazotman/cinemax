"use client";
import { useState, useEffect } from "react";

const TMDB_KEY = "9e1ddea24e6d93bc9571c7b18c0cf493";
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const SITE_URL = "https://cine-max.live";

const api = async (path, params = {}) => {
  const u = new URL(`${TMDB}${path}`);
  u.searchParams.set("api_key", TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u);
  return r.json();
};

const G = {
  bg: "#07090d", surface: "#0d1117", card: "#111820",
  border: "#1c2533", accent: "#e50914", gold: "#f5c518",
  text: "#eaeef2", muted: "#7a8fa6", soft: "#c0cdd8",
  font: "'Bebas Neue', sans-serif", body: "'DM Sans', sans-serif",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${G.bg};color:${G.text};font-family:${G.body}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp .45s ease both}
.spinner{width:40px;height:40px;border:3px solid ${G.border};border-top-color:${G.accent};border-radius:50%;animation:spin .8s linear infinite;margin:80px auto}
.btn{border:none;border-radius:7px;font-weight:600;transition:all .18s;display:inline-flex;align-items:center;gap:7px;cursor:pointer;font-family:${G.body}}
.btn-red{background:${G.accent};color:#fff;padding:12px 26px;font-size:.9rem}
.btn-red:hover{background:#c2070f}
.btn-ghost{background:rgba(255,255,255,.07);color:${G.text};border:1px solid ${G.border};padding:11px 20px;font-size:.875rem}
.btn-ghost:hover{background:rgba(255,255,255,.13)}
.rating{background:${G.gold};color:#000;font-weight:700;font-size:.72rem;padding:3px 8px;border-radius:4px;display:inline-flex;align-items:center;gap:3px}
.tag{background:${G.surface};border:1px solid ${G.border};color:${G.muted};padding:3px 9px;border-radius:4px;font-size:.75rem}
.badge{display:inline-block;background:${G.accent};color:#fff;font-size:.62rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:3px}
.cast-grid{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.cast-grid::-webkit-scrollbar{display:none}
.cast-card{flex-shrink:0;width:90px;text-align:center}
.cast-photo{width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 6px;border:2px solid ${G.border};background:${G.surface}}
.movie-card{border-radius:10px;overflow:hidden;background:${G.card};border:1px solid ${G.border};cursor:pointer;transition:transform .22s,box-shadow .22s}
.movie-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,.7)}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
.iframe-wrap{border-radius:10px;overflow:hidden;background:#000;width:100%;max-width:1000px}
.iframe-ratio{position:relative;padding-top:56.25%}
.iframe-ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.nav{position:sticky;top:0;z-index:200;background:${G.bg}f0;backdrop-filter:blur(16px);border-bottom:1px solid ${G.border};padding:0 clamp(14px,4vw,56px)}
.nav-inner{max-width:1400px;margin:0 auto;height:60px;display:flex;align-items:center;gap:20px}
.logo{font-family:${G.font};font-size:1.75rem;letter-spacing:3px;color:${G.accent};cursor:pointer;text-decoration:none}
.section-title{font-family:${G.font};font-size:clamp(1.3rem,2.5vw,1.8rem);letter-spacing:1.5px}
.scroll-row{display:flex;gap:14px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.scroll-row::-webkit-scrollbar{display:none}
.tab{background:none;border:none;color:${G.muted};font-size:.875rem;font-weight:600;padding:10px 18px;border-bottom:2px solid transparent;transition:color .18s,border-color .18s;cursor:pointer;font-family:${G.body}}
.tab.active{color:${G.text};border-bottom-color:${G.accent}}
@media(max-width:768px){
  .detail-main{flex-direction:column}
  .detail-poster{width:140px!important}
}
`;

export default function MoviePage({ params }) {
  const { id } = params;
  const type = "movie";

  const [data, setData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [related, setRelated] = useState([]);
  const [tab, setTab] = useState("overview");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    Promise.all([
      api(`/${type}/${id}`),
      api(`/${type}/${id}/credits`),
      api(`/${type}/${id}/videos`),
      api(`/${type}/${id}/similar`),
    ]).then(([d, c, v, r]) => {
      setData(d);
      setCredits(c);
      setVideos((v.results || []).filter(x => x.site === "YouTube" && (x.type === "Trailer" || x.type === "Teaser")));
      setRelated((r.results || []).filter(x => x.poster_path).slice(0, 12));
    });
  }, [id]);

  if (!data) return (
    <>
      <style>{CSS}</style>
      <nav className="nav"><div className="nav-inner"><a className="logo" href="/">CINEMAX</a></div></nav>
      <div className="spinner" />
    </>
  );

  const bg = data.backdrop_path ? `${IMG}/w1280${data.backdrop_path}` : null;
  const poster = data.poster_path ? `${IMG}/w500${data.poster_path}` : null;
  const cast = (credits?.cast || []).slice(0, 14);
  const trailer = videos[0];
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : "";
  const genres = (data.genres || []).map(g => g.name).join(", ");
  const year = (data.release_date || "").slice(0, 4);

  return (
    <>
      <style>{CSS}</style>

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-inner">
          <a className="logo" href="/">CINEMAX</a>
          <a href="/" style={{ color: G.muted, fontSize: ".85rem", textDecoration: "none" }}>← Back to Home</a>
        </div>
      </nav>

      {/* Hero backdrop */}
      <div style={{ position: "relative", minHeight: 420, overflow: "hidden" }}>
        {bg && <img src={bg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: "brightness(.3)" }} />}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${G.bg} 0%,${G.bg}88 40%,transparent 100%)` }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(14px,4vw,56px)" }}>
          <div className="detail-main" style={{ display: "flex", gap: "clamp(20px,4vw,48px)", alignItems: "flex-start" }}>
            {poster && (
              <img
                src={poster} alt={data.title}
                className="detail-poster"
                style={{ width: "clamp(140px,18vw,240px)", flexShrink: 0, borderRadius: 10, boxShadow: "0 20px 60px rgba(0,0,0,.8)", border: `1px solid ${G.border}` }}
              />
            )}
            <div style={{ flex: 1, minWidth: 260 }} className="fade-up">
              <h1 style={{ fontFamily: G.font, fontSize: "clamp(1.8rem,5vw,3.5rem)", letterSpacing: 2, lineHeight: 1.05, marginBottom: 12 }}>
                {data.title}
              </h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
                <span className="rating">★ {Number(data.vote_average || 0).toFixed(1)}</span>
                {year && <span className="tag">{year}</span>}
                {runtime && <span className="tag">{runtime}</span>}
                {data.status && <span className="tag">{data.status}</span>}
              </div>
              {genres && <p style={{ color: G.muted, fontSize: ".8rem", marginBottom: 12 }}>{genres}</p>}
              <p style={{ color: G.soft, fontSize: "clamp(.875rem,1.5vw,1rem)", lineHeight: 1.8, marginBottom: 20, maxWidth: 600 }}>
                {data.overview}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-red" onClick={() => setPlaying(true)}>▶ Watch Now — Free</button>
                <a href="/" className="btn btn-ghost" style={{ textDecoration: "none" }}>🏠 More Movies</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(14px,4vw,56px) 60px" }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${G.border}`, marginBottom: 24 }}>
          {["overview", "cast", "trailer", "related"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
            {[
              ["Director", (credits?.crew || []).find(c => c.job === "Director")?.name],
              ["Language", data.original_language?.toUpperCase()],
              ["Budget", data.budget > 0 ? `$${(data.budget / 1e6).toFixed(1)}M` : null],
              ["Revenue", data.revenue > 0 ? `$${(data.revenue / 1e6).toFixed(1)}M` : null],
              ["Vote Count", data.vote_count?.toLocaleString()],
              ["Popularity", Math.round(data.popularity)],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ color: G.muted, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "cast" && (
          <div className="cast-grid">
            {cast.map(c => (
              <div key={c.id} className="cast-card">
                <img className="cast-photo"
                  src={c.profile_path ? `${IMG}/w185${c.profile_path}` : `https://via.placeholder.com/72x72/111820/7a8fa6?text=?`}
                  alt={c.name} loading="lazy" />
                <div style={{ fontSize: ".72rem", fontWeight: 600, color: G.text, lineHeight: 1.3 }}>{c.name}</div>
                <div style={{ fontSize: ".68rem", color: G.muted, marginTop: 2 }}>{c.character}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "trailer" && (
          <div>
            {trailer ? (
              <div style={{ maxWidth: 800 }}>
                <div style={{ borderRadius: 10, overflow: "hidden", background: "#000" }}>
                  <div style={{ position: "relative", paddingTop: "56.25%" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                      allowFullScreen title={trailer.name}
                    />
                  </div>
                </div>
                <p style={{ color: G.muted, fontSize: ".8rem", marginTop: 10 }}>{trailer.name}</p>
              </div>
            ) : <p style={{ color: G.muted }}>No trailer available.</p>}
          </div>
        )}

        {tab === "related" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14 }}>
            {related.map(m => (
              <a key={m.id} href={`/movie/${m.id}`} style={{ textDecoration: "none" }}>
                <div className="movie-card">
                  <div style={{ position: "relative", aspectRatio: "2/3" }}>
                    <img src={`${IMG}/w342${m.poster_path}`} alt={m.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <span className="rating">★ {Number(m.vote_average || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontWeight: 600, fontSize: ".85rem", color: G.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                    <div style={{ fontSize: ".75rem", color: G.muted, marginTop: 3 }}>{(m.release_date || "").slice(0, 4)}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* SEO text block */}
        <div style={{ marginTop: 48, padding: "24px", background: G.card, borderRadius: 10, border: `1px solid ${G.border}` }}>
          <h2 style={{ fontFamily: G.font, fontSize: "1.3rem", letterSpacing: 1, marginBottom: 12 }}>
            Watch {data.title} ({year}) Online Free
          </h2>
          <p style={{ color: G.muted, fontSize: ".875rem", lineHeight: 1.8 }}>
            Watch <strong style={{ color: G.text }}>{data.title}</strong> online for free on CINEMAX.
            {data.overview ? ` ${data.overview.slice(0, 300)}` : ""}
            {genres ? ` Genre: ${genres}.` : ""}
            {runtime ? ` Runtime: ${runtime}.` : ""}
            {" "}Stream {data.title} in HD quality without any subscription.
          </p>
        </div>
      </div>

      {/* Player Modal */}
      {playing && (
        <div className="modal-bg" onClick={() => setPlaying(false)}>
          <div style={{ width: "100%", maxWidth: 1000, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPlaying(false)}
              style={{ position: "absolute", top: -42, right: 0, background: "none", border: "none", color: G.text, fontSize: ".85rem", fontWeight: 600, cursor: "pointer", padding: 8, display: "flex", alignItems: "center", gap: 6 }}>
              ✕ Close Player
            </button>
            <div className="iframe-wrap">
              <div className="iframe-ratio">
                <iframe
                  src={`https://vidsrc.to/embed/movie/${id}`}
                  allowFullScreen referrerPolicy="origin"
                  title={data.title}
                />
              </div>
              <div style={{ background: G.surface, padding: "14px 18px" }}>
                <span style={{ fontFamily: G.font, fontSize: "1.2rem", letterSpacing: 1 }}>{data.title}</span>
                <span className="rating" style={{ marginLeft: 12 }}>★ {Number(data.vote_average || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
