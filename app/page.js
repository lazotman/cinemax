"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const SITE_NAME = "CINEMAX";
const SITE_URL = "https://cinemax.me";

// ✅ Cache للـ API — يمنع إعادة الطلب لنفس البيانات
const apiCache = new Map();

const api = async (path, params = {}) => {
  const u = new URL(`${TMDB}${path}`);
  u.searchParams.set("api_key", TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  const key = u.toString();
  if (apiCache.has(key)) return apiCache.get(key);
  const r = await fetch(u);
  const data = await r.json();
  apiCache.set(key, data);
  return data;
};

const embedUrl = (id, type = "movie") =>
  `https://vidsrc.me/embed/${type}?tmdb=${id}`;

// ─── WATCHLIST (localStorage) ────────────────────────────────────────────────
const WL_KEY = "cinemax_watchlist";
const getWL = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); } catch { return []; } };
const saveWL = (list) => localStorage.setItem(WL_KEY, JSON.stringify(list));

// ─── SEO HEAD ────────────────────────────────────────────────────────────────
const updateSEO = ({ title, description, image, type = "website", keywords = "" }) => {
  document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Watch Free Movies & TV Shows Online`;
  const desc = description || `Watch the latest movies and TV shows free online on ${SITE_NAME}.`;
  const img = image || `${SITE_URL}/og.jpg`;

  const descEl = document.querySelector('meta[name="description"]') || (() => { const e = document.createElement("meta"); e.name = "description"; document.head.appendChild(e); return e; })();
  descEl.content = desc;

  if (keywords) {
    const kwEl = document.querySelector('meta[name="keywords"]') || (() => { const e = document.createElement("meta"); e.name = "keywords"; document.head.appendChild(e); return e; })();
    kwEl.content = keywords;
  }

  [
    ['og:title', title || SITE_NAME],
    ['og:description', desc],
    ['og:image', img],
    ['og:type', type],
    ['og:site_name', SITE_NAME],
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', title || SITE_NAME],
    ['twitter:description', desc],
    ['twitter:image', img],
  ].forEach(([prop, val]) => {
    const isProp = prop.startsWith("og:");
    const sel = isProp ? `meta[property="${prop}"]` : `meta[name="${prop}"]`;
    let el = document.querySelector(sel);
    if (!el) {
      el = document.createElement("meta");
      if (isProp) el.setAttribute("property", prop);
      else el.setAttribute("name", prop);
      document.head.appendChild(el);
    }
    el.setAttribute("content", val);
  });

  let canon = document.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
  canon.href = SITE_URL;

  let schema = document.querySelector('#schema-ld');
  if (!schema) { schema = document.createElement("script"); schema.id = "schema-ld"; schema.type = "application/ld+json"; document.head.appendChild(schema); }
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": type === "video.movie" ? "Movie" : "WebSite",
    "name": title || SITE_NAME,
    "description": desc,
    "url": SITE_URL,
    "image": img,
  });
};

// ─── GENRES ──────────────────────────────────────────────────────────────────
const GENRES = [
  { id: 28, name: "Action", emoji: "💥" },
  { id: 12, name: "Adventure", emoji: "🗺️" },
  { id: 16, name: "Animation", emoji: "🎨" },
  { id: 35, name: "Comedy", emoji: "😂" },
  { id: 80, name: "Crime", emoji: "🔫" },
  { id: 18, name: "Drama", emoji: "🎭" },
  { id: 14, name: "Fantasy", emoji: "🧙" },
  { id: 27, name: "Horror", emoji: "👻" },
  { id: 9648, name: "Mystery", emoji: "🔍" },
  { id: 10749, name: "Romance", emoji: "❤️" },
  { id: 878, name: "Sci-Fi", emoji: "🚀" },
  { id: 53, name: "Thriller", emoji: "😱" },
];

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const G = {
  bg: "#07090d",
  surface: "#0d1117",
  card: "#111820",
  border: "#1c2533",
  accent: "#e50914",
  accentHover: "#c2070f",
  gold: "#f5c518",
  text: "#eaeef2",
  muted: "#7a8fa6",
  soft: "#c0cdd8",
  // ✅ استخدام CSS variables بدل Google Fonts import مباشرة
  font: "var(--font-bebas), 'Oswald', sans-serif",
  body: "var(--font-dm), 'DM Sans', sans-serif",
  radius: "10px",
};

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const CSS = `
/* ✅ حُذف @import Google Fonts — الخطوط تأتي من layout.js عبر next/font */

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:${G.bg};color:${G.text};font-family:${G.body};font-size:16px;line-height:1.5;overflow-x:hidden}
img{display:block;max-width:100%}
button{font-family:${G.body};cursor:pointer}
input{font-family:${G.body}}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:${G.bg}}
::-webkit-scrollbar-thumb{background:${G.accent};border-radius:3px}

@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes popIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}

.fade-up{animation:fadeUp .45s ease both}
.fade-in{animation:fadeIn .3s ease both}
.pop-in{animation:popIn .3s ease both}

.movie-card{
  border-radius:${G.radius};overflow:hidden;
  background:${G.card};border:1px solid ${G.border};
  cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,border-color .22s;
  position:relative;
}
.movie-card:hover{transform:translateY(-6px) scale(1.02);box-shadow:0 16px 40px rgba(0,0,0,.7),0 0 0 1px ${G.accent}55;border-color:${G.accent}44}

.card-img-wrap{position:relative;aspect-ratio:2/3;overflow:hidden;background:${G.surface}}
.card-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.movie-card:hover .card-img-wrap img{transform:scale(1.05)}

.card-overlay{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(0,0,0,.9) 0%,rgba(0,0,0,.3) 50%,transparent 100%);
  opacity:0;transition:opacity .25s;
  display:flex;flex-direction:column;justify-content:flex-end;padding:12px;gap:8px
}
.movie-card:hover .card-overlay{opacity:1}

.shimmer{
  background:linear-gradient(90deg,${G.card} 25%,${G.border} 50%,${G.card} 75%);
  background-size:600px 100%;animation:shimmer 1.5s infinite;border-radius:${G.radius}
}

.btn{border:none;border-radius:7px;font-weight:600;transition:all .18s;display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.btn-red{background:${G.accent};color:#fff;padding:11px 22px;font-size:.875rem}
.btn-red:hover{background:${G.accentHover};transform:scale(1.02)}
.btn-red:active{transform:scale(.97)}
.btn-ghost{background:rgba(255,255,255,.07);color:${G.text};border:1px solid ${G.border};padding:10px 20px;font-size:.875rem}
.btn-ghost:hover{background:rgba(255,255,255,.13)}
.btn-icon{background:rgba(255,255,255,.09);color:${G.text};border:1px solid ${G.border};padding:9px 14px;border-radius:8px;font-size:.8rem}
.btn-icon:hover{background:rgba(255,255,255,.16)}
.btn-sm{padding:7px 14px;font-size:.78rem;border-radius:6px}

.nav{
  position:sticky;top:0;z-index:200;
  background:${G.bg}f0;backdrop-filter:blur(16px);
  border-bottom:1px solid ${G.border};
}
.nav-inner{
  max-width:1400px;margin:0 auto;
  padding:0 clamp(14px,4vw,56px);
  height:60px;display:flex;align-items:center;gap:24px
}
.logo{font-family:${G.font};font-size:1.75rem;letter-spacing:3px;color:${G.accent};cursor:pointer;user-select:none;flex-shrink:0}
.nav-links{display:flex;gap:20px;flex:1}
.nav-link{color:${G.muted};text-decoration:none;font-size:.83rem;font-weight:500;letter-spacing:.5px;text-transform:uppercase;transition:color .18s;cursor:pointer;padding:4px 0;border-bottom:2px solid transparent;transition:color .18s,border-color .18s}
.nav-link:hover,.nav-link.active{color:${G.text}}
.nav-link.active{border-bottom-color:${G.accent}}
.search-wrap{position:relative;flex-shrink:0}
.search-input{
  background:${G.surface};border:1px solid ${G.border};color:${G.text};
  padding:9px 14px 9px 38px;border-radius:8px;font-size:.85rem;
  width:200px;transition:border-color .2s,width .3s;outline:none
}
.search-input:focus{border-color:${G.accent};width:260px}
.search-input::placeholder{color:${G.muted}}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:${G.muted};font-size:.85rem;pointer-events:none}

.mobile-search{
  padding:10px clamp(14px,4vw,56px);
  border-bottom:1px solid ${G.border};
  display:none
}
.mobile-search .search-input{width:100%}
.mobile-search .search-input:focus{width:100%}
.hamburger{display:none;background:none;border:none;color:${G.text};font-size:1.3rem;padding:4px}
.mobile-menu{
  display:none;position:fixed;inset:0;z-index:300;
  background:${G.surface};padding:20px clamp(14px,4vw,56px);
  flex-direction:column;gap:8px
}
.mobile-menu.open{display:flex}
.mobile-nav-link{color:${G.text};font-size:1.1rem;font-weight:500;padding:14px 0;border-bottom:1px solid ${G.border};cursor:pointer;display:flex;align-items:center;justify-content:space-between}

.genre-bar{max-width:1400px;margin:0 auto;padding:8px clamp(14px,4vw,56px) 12px}
.genre-scroll{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.genre-scroll::-webkit-scrollbar{display:none}
.genre-chip{background:${G.card};border:1px solid ${G.border};color:${G.muted};padding:6px 14px;border-radius:20px;font-size:.75rem;font-weight:500;letter-spacing:.4px;text-transform:uppercase;cursor:pointer;transition:all .18s;white-space:nowrap;flex-shrink:0}
.genre-chip:hover,.genre-chip.active{background:${G.accent};border-color:${G.accent};color:#fff}

.hero{position:relative;min-height:min(72vh,600px);display:flex;align-items:center;overflow:hidden}
.hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;filter:brightness(.4)}
.hero-grad{position:absolute;inset:0;background:linear-gradient(to right,${G.bg} 0%,${G.bg}bb 35%,transparent 65%),linear-gradient(to top,${G.bg} 0%,transparent 45%)}
.hero-content{position:relative;z-index:1;padding:clamp(50px,8vw,90px) clamp(14px,4vw,56px);max-width:680px}
.hero-title{font-family:${G.font};font-size:clamp(2.4rem,7vw,5.5rem);line-height:1;letter-spacing:2px;text-shadow:0 2px 20px rgba(229,9,20,.4)}
.hero-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:14px 0 16px}
.hero-overview{color:#bfcdd8;font-size:clamp(.875rem,1.5vw,1rem);line-height:1.7;max-width:520px;margin-bottom:24px}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}

.rating{background:${G.gold};color:#000;font-weight:700;font-size:.72rem;padding:3px 8px;border-radius:4px;display:inline-flex;align-items:center;gap:3px;flex-shrink:0}
.tag{background:${G.surface};border:1px solid ${G.border};color:${G.muted};padding:3px 9px;border-radius:4px;font-size:.75rem}
.badge{display:inline-block;background:${G.accent};color:#fff;font-size:.62rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:3px}

.section{margin-bottom:44px}
.section-head{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.section-title{font-family:${G.font};font-size:clamp(1.3rem,2.5vw,1.8rem);letter-spacing:1.5px}
.section-line{flex:1;height:1px;background:linear-gradient(90deg,${G.border},transparent)}
.section-more{color:${G.accent};font-size:.8rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .18s}
.section-more:hover{opacity:.75}

.scroll-row{display:flex;gap:14px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.scroll-row::-webkit-scrollbar{display:none}
.scroll-item{flex-shrink:0;width:clamp(130px,16vw,185px)}

.movie-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px}
@media(min-width:480px){.movie-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}
@media(min-width:768px){.movie-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}}

.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease}
.modal-box{width:100%;max-width:1000px;position:relative}
.modal-close{position:absolute;top:-42px;right:0;background:none;border:none;color:${G.text};font-size:.85rem;font-weight:600;cursor:pointer;padding:8px;opacity:.8;transition:opacity .18s;display:flex;align-items:center;gap:6px}
.modal-close:hover{opacity:1}
.iframe-wrap{border-radius:${G.radius};overflow:hidden;background:#000;box-shadow:0 30px 80px rgba(0,0,0,.9)}
.iframe-ratio{position:relative;padding-top:56.25%}
.iframe-ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.modal-info{background:${G.surface};padding:14px 18px;border-top:1px solid ${G.border}}

.detail-bg{position:relative;min-height:420px;overflow:hidden}
.detail-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;filter:brightness(.3)}
.detail-bg-grad{position:absolute;inset:0;background:linear-gradient(to top,${G.bg} 0%,${G.bg}88 40%,transparent 100%)}
.detail-layout{max-width:1400px;margin:0 auto;padding:0 clamp(14px,4vw,56px)}
.detail-main{position:relative;z-index:1;padding-top:clamp(40px,6vw,80px);display:flex;gap:clamp(20px,4vw,48px);align-items:flex-start;flex-wrap:wrap}
.detail-poster{width:clamp(140px,18vw,240px);flex-shrink:0;border-radius:${G.radius};overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.8);border:1px solid ${G.border}}
.detail-info{flex:1;min-width:260px}
.detail-title{font-family:${G.font};font-size:clamp(1.8rem,5vw,3.5rem);letter-spacing:2px;line-height:1.05;margin-bottom:12px}
.detail-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.detail-overview{color:${G.soft};font-size:clamp(.875rem,1.5vw,1rem);line-height:1.8;margin-bottom:20px}
.detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}

.cast-grid{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.cast-grid::-webkit-scrollbar{display:none}
.cast-card{flex-shrink:0;width:90px;text-align:center;cursor:default}
.cast-photo{width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 6px;border:2px solid ${G.border};background:${G.surface}}
.cast-name{font-size:.72rem;font-weight:600;color:${G.text};line-height:1.3}
.cast-char{font-size:.68rem;color:${G.muted};margin-top:2px}

.trailer-wrap{border-radius:${G.radius};overflow:hidden;background:#000}
.trailer-ratio{position:relative;padding-top:56.25%}
.trailer-ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:none}

.wl-empty{text-align:center;padding:60px 20px;color:${G.muted}}
.wl-empty-icon{font-size:3rem;margin-bottom:12px}

.search-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}

.tabs{display:flex;gap:0;border-bottom:1px solid ${G.border};margin-bottom:24px}
.tab{background:none;border:none;color:${G.muted};font-size:.875rem;font-weight:600;padding:10px 18px;border-bottom:2px solid transparent;transition:color .18s,border-color .18s;letter-spacing:.3px}
.tab.active{color:${G.text};border-bottom-color:${G.accent}}
.tab:hover{color:${G.soft}}

.spinner{width:36px;height:36px;border:3px solid ${G.border};border-top-color:${G.accent};border-radius:50%;animation:spin .8s linear infinite;margin:60px auto}

.page{max-width:1400px;margin:0 auto;padding:32px clamp(14px,4vw,56px) 60px}

@media(max-width:768px){
  .nav-links{display:none}
  .hamburger{display:block}
  .search-wrap{display:none}
  .mobile-search{display:block}
  .hero{min-height:auto}
  .hero-grad{background:linear-gradient(to top,${G.bg} 0%,${G.bg}99 45%,transparent 100%)}
  .detail-poster{width:clamp(110px,28vw,160px)}
  .genre-bar{display:none}
}
@media(max-width:480px){
  .hero-title{font-size:2rem}
  .detail-title{font-size:1.6rem}
  .hero-content{padding:40px 14px}
}

.wl-btn-active{background:${G.accent}!important;border-color:${G.accent}!important;color:#fff!important}
`;

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const RatingBadge = ({ v }) => (
  <span className="rating">★ {Number(v || 0).toFixed(1)}</span>
);

const ShimmerCard = () => (
  <div>
    <div className="shimmer" style={{ aspectRatio: "2/3", marginBottom: 8 }} />
    <div className="shimmer" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
    <div className="shimmer" style={{ height: 11, width: "60%", borderRadius: 4 }} />
  </div>
);

const MovieCard = ({ movie, onPlay, onDetail, delay = 0 }) => {
  const poster = movie.poster_path ? `${IMG}/w342${movie.poster_path}` : null;
  const title = movie.title || movie.name || "";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const type = movie.media_type || (movie.first_air_date !== undefined ? "tv" : "movie");
  return (
    <div
      className="movie-card fade-up"
      style={{ animationDelay: `${delay}s` }}
      onClick={() => onDetail(movie)}
    >
      <div className="card-img-wrap">
        {poster
          // ✅ أضفنا width و height لتجنب Layout Shift (CLS)
          ? <img src={poster} alt={title} loading="lazy" width={342} height={513} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", background: G.surface }}>🎬</div>
        }
        <div style={{ position: "absolute", top: 8, right: 8 }}><RatingBadge v={movie.vote_average} /></div>
        {type === "tv" && <div style={{ position: "absolute", top: 8, left: 8 }}><span className="badge" style={{ background: "#0066ff" }}>TV</span></div>}
        <div className="card-overlay">
          <button className="btn btn-red btn-sm" onClick={e => { e.stopPropagation(); onPlay(movie, type); }} style={{ justifyContent: "center" }}>
            ▶ Watch
          </button>
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onDetail(movie); }} style={{ justifyContent: "center" }}>
            ℹ Details
          </button>
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontWeight: 600, fontSize: ".85rem", color: G.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: ".75rem", color: G.muted, marginTop: 3 }}>{year}</div>
      </div>
    </div>
  );
};

const ScrollSection = ({ title, movies, onPlay, onDetail, onMore }) => (
  <div className="section">
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      <div className="section-line" />
      {onMore && <span className="section-more" onClick={onMore}>See All →</span>}
    </div>
    <div className="scroll-row">
      {movies.map((m, i) => (
        <div key={m.id} className="scroll-item">
          <MovieCard movie={m} onPlay={onPlay} onDetail={onDetail} delay={i * 0.03} />
        </div>
      ))}
    </div>
  </div>
);

const GridSection = ({ movies, onPlay, onDetail, loading }) => {
  if (loading) return (
    <div className="movie-grid">
      {Array(12).fill(0).map((_, i) => <ShimmerCard key={i} />)}
    </div>
  );
  return (
    <div className="movie-grid">
      {movies.map((m, i) => (
        <MovieCard key={m.id} movie={m} onPlay={onPlay} onDetail={onDetail} delay={i * 0.03} />
      ))}
    </div>
  );
};

const PlayerModal = ({ movie, type, onClose }) => (
  <div className="modal-bg" onClick={onClose}>
    <div className="modal-box pop-in" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>✕ Close Player</button>
      <div className="iframe-wrap">
        <div className="iframe-ratio">
          <iframe
            src={embedUrl(movie.id, type)}
            allowFullScreen
            referrerPolicy="origin"
            title={movie.title || movie.name}
          />
        </div>
        <div className="modal-info">
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge" style={{ background: type === "tv" ? "#0066ff" : G.accent }}>{type === "tv" ? "TV Show" : "Movie"}</span>
            <span style={{ fontFamily: G.font, fontSize: "1.2rem", letterSpacing: 1 }}>{movie.title || movie.name}</span>
            <RatingBadge v={movie.vote_average} />
          </div>
          {movie.overview && (
            <p style={{ color: G.muted, fontSize: ".8rem", marginTop: 8, lineHeight: 1.6 }}>
              {movie.overview.slice(0, 200)}{movie.overview.length > 200 ? "…" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Hero = ({ movie, onPlay, onDetail }) => {
  if (!movie) return null;
  const bg = movie.backdrop_path ? `${IMG}/w1280${movie.backdrop_path}` : null;
  return (
    <div className="hero">
      {/* ✅ أضفنا width و height و fetchpriority للصورة الرئيسية */}
      {bg && <img className="hero-bg" src={bg} alt="" width={1280} height={720} fetchPriority="high" />}
      <div className="hero-grad" />
      <div className="hero-content">
        <div style={{ marginBottom: 10 }}><span className="badge">🔥 Trending</span></div>
        <h1 className="hero-title fade-up">{movie.title}</h1>
        <div className="hero-meta fade-up">
          <RatingBadge v={movie.vote_average} />
          <span className="tag">{movie.release_date?.slice(0, 4)}</span>
          {movie.adult === false && <span className="tag">PG</span>}
        </div>
        <p className="hero-overview fade-up">{movie.overview?.slice(0, 240)}…</p>
        <div className="hero-actions fade-up">
          <button className="btn btn-red" onClick={() => onPlay(movie, "movie")}>▶ Watch Now</button>
          <button className="btn btn-ghost" onClick={() => onDetail(movie)}>ℹ More Info</button>
        </div>
      </div>
    </div>
  );
};

const DetailPage = ({ movieId, movieType, onPlay, onDetail, onBack }) => {
  const [data, setData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [related, setRelated] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
    const type = movieType || "movie";
    Promise.all([
      api(`/${type}/${movieId}`),
      api(`/${type}/${movieId}/credits`),
      api(`/${type}/${movieId}/videos`),
      api(`/${type}/${movieId}/similar`),
    ]).then(([d, c, v, r]) => {
      setData(d);
      setCredits(c);
      setVideos((v.results || []).filter(x => x.site === "YouTube" && (x.type === "Trailer" || x.type === "Teaser")));
      setRelated((r.results || []).filter(x => x.poster_path).slice(0, 12));
      updateSEO({
        title: d.title || d.name,
        description: d.overview,
        image: d.backdrop_path ? `${IMG}/w1280${d.backdrop_path}` : undefined,
        type: "video.movie",
        keywords: `watch ${d.title || d.name} online free, ${d.title || d.name} streaming, ${SITE_NAME}`,
      });
    });
    return () => updateSEO({});
  }, [movieId, movieType]);

  if (!data) return <div className="spinner" />;

  const type = movieType || "movie";
  const bg = data.backdrop_path ? `${IMG}/w1280${data.backdrop_path}` : null;
  const poster = data.poster_path ? `${IMG}/w500${data.poster_path}` : null;
  const cast = (credits?.cast || []).slice(0, 14);
  const trailer = videos[0];
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : data.episode_run_time?.[0] ? `${data.episode_run_time[0]}m/ep` : "";
  const genres = (data.genres || []).map(g => g.name).join(", ");

  return (
    <div className="fade-in">
      <div className="detail-bg">
        {/* ✅ أضفنا width و height */}
        {bg && <img className="detail-bg-img" src={bg} alt="" width={1280} height={720} />}
        <div className="detail-bg-grad" />
        <div className="detail-layout">
          <div className="detail-main">
            <div style={{ width: "100%", marginBottom: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
            </div>
            {poster && <img className="detail-poster" src={poster} alt={data.title || data.name} width={500} height={750} />}
            <div className="detail-info">
              <h1 className="detail-title">{data.title || data.name}</h1>
              <div className="detail-meta">
                <RatingBadge v={data.vote_average} />
                {runtime && <span className="tag">{runtime}</span>}
                <span className="tag">{(data.release_date || data.first_air_date || "").slice(0, 4)}</span>
                {data.status && <span className="tag">{data.status}</span>}
              </div>
              {genres && <p style={{ color: G.muted, fontSize: ".8rem", marginBottom: 12 }}>{genres}</p>}
              <p className="detail-overview">{data.overview}</p>
              <WatchlistBtn movie={data} type={type} />
              <div className="detail-actions">
                <button className="btn btn-red" onClick={() => onPlay(data, type)}>▶ Watch Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-layout" style={{ marginTop: 32 }}>
        <div className="tabs">
          {["overview", "cast", "trailer", "related"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="fade-in" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {[
              ["Director", (credits?.crew || []).find(c => c.job === "Director")?.name || "—"],
              ["Language", data.original_language?.toUpperCase() || "—"],
              ["Budget", data.budget ? `$${(data.budget / 1e6).toFixed(1)}M` : "—"],
              ["Revenue", data.revenue ? `$${(data.revenue / 1e6).toFixed(1)}M` : "—"],
              ["Seasons", data.number_of_seasons || "—"],
              ["Episodes", data.number_of_episodes || "—"],
            ].filter(([, v]) => v !== "—").map(([label, value]) => (
              <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ color: G.muted, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "cast" && (
          <div className="cast-grid fade-in">
            {cast.length === 0 && <p style={{ color: G.muted }}>No cast info available.</p>}
            {cast.map(c => (
              <div key={c.id} className="cast-card">
                <img
                  className="cast-photo"
                  src={c.profile_path ? `${IMG}/w185${c.profile_path}` : "https://via.placeholder.com/72x72/111820/7a8fa6?text=?"}
                  alt={c.name}
                  loading="lazy"
                  width={72}
                  height={72}
                />
                <div className="cast-name">{c.name}</div>
                <div className="cast-char">{c.character}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "trailer" && (
          <div className="fade-in">
            {trailer ? (
              <div style={{ maxWidth: 800 }}>
                <div className="trailer-wrap">
                  <div className="trailer-ratio">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
                      allowFullScreen
                      title={trailer.name}
                    />
                  </div>
                </div>
                <p style={{ color: G.muted, fontSize: ".8rem", marginTop: 10 }}>{trailer.name}</p>
                {videos.length > 1 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    {videos.slice(1).map(v => (
                      <a key={v.id} href={`https://youtube.com/watch?v=${v.key}`} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm">▶ {v.name.slice(0, 30)}</a>
                    ))}
                  </div>
                )}
              </div>
            ) : <p style={{ color: G.muted }}>No trailer available.</p>}
          </div>
        )}

        {tab === "related" && (
          <div className="movie-grid fade-in">
            {related.map((m, i) => (
              <MovieCard key={m.id} movie={m} onPlay={onPlay} onDetail={onDetail} delay={i * 0.03} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WatchlistBtn = ({ movie, type }) => {
  const [inWL, setInWL] = useState(() => getWL().some(m => m.id === movie.id));
  const toggle = () => {
    let wl = getWL();
    if (inWL) {
      wl = wl.filter(m => m.id !== movie.id);
    } else {
      wl = [{ ...movie, _type: type }, ...wl];
    }
    saveWL(wl);
    setInWL(!inWL);
  };
  return (
    <button
      className={`btn btn-icon ${inWL ? "wl-btn-active" : ""}`}
      onClick={toggle}
      style={{ marginBottom: 12 }}
    >
      {inWL ? "✓ In Watchlist" : "+ Add to Watchlist"}
    </button>
  );
};

const WatchlistPage = ({ onPlay, onDetail }) => {
  const [list, setList] = useState(getWL);
  const remove = (id) => {
    const updated = list.filter(m => m.id !== id);
    saveWL(updated);
    setList(updated);
  };
  if (list.length === 0) return (
    <div className="page">
      <div className="wl-empty fade-up">
        <div className="wl-empty-icon">🎬</div>
        <h2 style={{ fontFamily: G.font, fontSize: "1.6rem", letterSpacing: 1, marginBottom: 8 }}>Your Watchlist is Empty</h2>
        <p>Add movies and shows you want to watch later.</p>
      </div>
    </div>
  );
  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <h1 className="section-title">My Watchlist</h1>
        <span className="tag">{list.length} titles</span>
      </div>
      <div className="movie-grid">
        {list.map((m, i) => (
          <div key={m.id} style={{ position: "relative" }}>
            <MovieCard movie={m} onPlay={onPlay} onDetail={onDetail} delay={i * 0.03} />
            <button
              onClick={() => remove(m.id)}
              style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,.75)", border: "none", color: "#fff", width: 26, height: 26, borderRadius: "50%", fontSize: ".85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SearchPage = ({ query, onPlay, onDetail }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api("/search/multi", { query, page: 1 }).then(d => {
      setResults((d.results || []).filter(r => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path));
      setLoading(false);
    });
  }, [query]);
  return (
    <div className="page">
      <div className="search-header">
        <h1 style={{ fontFamily: G.font, fontSize: "1.6rem", letterSpacing: 1 }}>Search Results</h1>
        <span className="tag">"{query}"</span>
        {!loading && <span style={{ color: G.muted, fontSize: ".8rem" }}>{results.length} found</span>}
      </div>
      {loading ? <div className="movie-grid">{Array(8).fill(0).map((_, i) => <ShimmerCard key={i} />)}</div>
        : results.length === 0
          ? <p style={{ color: G.muted, padding: "40px 0" }}>No results found for "{query}".</p>
          : <div className="movie-grid">{results.map((m, i) => <MovieCard key={m.id} movie={m} onPlay={onPlay} onDetail={onDetail} delay={i * 0.03} />)}</div>
      }
    </div>
  );
};

const GenrePage = ({ genreId, onPlay, onDetail }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const genre = GENRES.find(g => g.id === genreId);
  useEffect(() => {
    setLoading(true);
    api("/discover/movie", { with_genres: genreId, sort_by: "popularity.desc", page: 1 })
      .then(d => { setMovies(d.results || []); setLoading(false); });
  }, [genreId]);
  useEffect(() => {
    if (genre) updateSEO({ title: `${genre.name} Movies`, keywords: `${genre.name} movies online free` });
    return () => updateSEO({});
  }, [genre]);
  return (
    <div className="page">
      <h1 className="section-title" style={{ marginBottom: 24 }}>{genre?.emoji} {genre?.name} Movies</h1>
      <GridSection movies={movies} onPlay={onPlay} onDetail={onDetail} loading={loading} />
    </div>
  );
};

const ListPage = ({ title, type, onPlay, onDetail }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = type === "movie"
    ? [{ label: "Popular", path: "/movie/popular" }, { label: "Top Rated", path: "/movie/top_rated" }, { label: "Now Playing", path: "/movie/now_playing" }, { label: "Upcoming", path: "/movie/upcoming" }]
    : [{ label: "Popular", path: "/tv/popular" }, { label: "Top Rated", path: "/tv/top_rated" }, { label: "On Air", path: "/tv/on_the_air" }, { label: "Airing Today", path: "/tv/airing_today" }];

  useEffect(() => {
    setLoading(true);
    api(tabs[activeTab].path, { page: 1 })
      .then(d => { setItems((d.results || []).filter(m => m.poster_path)); setLoading(false); });
  }, [activeTab, type]);

  return (
    <div className="page">
      <h1 className="section-title" style={{ marginBottom: 20 }}>{title}</h1>
      <div className="tabs">
        {tabs.map((t, i) => (
          <button key={i} className={`tab ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>{t.label}</button>
        ))}
      </div>
      <GridSection movies={items} onPlay={onPlay} onDetail={onDetail} loading={loading} />
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [nav, setNav] = useState({ page: "home" });
  const [playing, setPlaying] = useState(null);
  const [playType, setPlayType] = useState("movie");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [tvPopular, setTvPopular] = useState([]);
  const [hero, setHero] = useState(null);
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    updateSEO({});
    // ✅ نحمّل trending أولاً لإظهار الـ hero بسرعة، ثم الباقي في الخلفية
    api("/trending/movie/week").then(t => {
      const results = t.results || [];
      setTrending(results);
      setHero(results.find(m => m.backdrop_path));

      Promise.all([
        api("/movie/popular"),
        api("/movie/top_rated"),
        api("/tv/popular"),
      ]).then(([p, tr, tv]) => {
        setPopular(p.results || []);
        setTopRated(tr.results || []);
        setTvPopular(tv.results || []);
        setHomeLoading(false);
      });
    });
  }, []);

  const go = useCallback((page, params = {}) => {
    setNav({ page, ...params });
    setMobileMenu(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handlePlay = useCallback((movie, type = "movie") => {
    setPlaying(movie);
    setPlayType(type);
  }, []);

  const handleDetail = useCallback((movie) => {
    const type = movie.media_type || (movie.first_air_date !== undefined ? "tv" : "movie");
    go("detail", { movieId: movie.id, movieType: type });
  }, [go]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    go("search", { query: searchInput.trim() });
    setSearchInput("");
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      {[
        { label: "Home", page: "home" },
        { label: "Movies", page: "movies" },
        { label: "TV Shows", page: "tv" },
        { label: "Watchlist", page: "watchlist" },
      ].map(n => (
        <span
          key={n.page}
          className={`${mobile ? "mobile-nav-link" : "nav-link"} ${nav.page === n.page ? "active" : ""}`}
          onClick={() => go(n.page)}
        >
          {n.label} {mobile && <span>›</span>}
        </span>
      ))}
    </>
  );

  const renderPage = () => {
    switch (nav.page) {
      case "home":
        return (
          <>
            <Hero movie={hero} onPlay={handlePlay} onDetail={handleDetail} />
            <div className="page" style={{ paddingTop: 36 }}>
              {homeLoading ? (
                <div className="movie-grid">{Array(8).fill(0).map((_, i) => <ShimmerCard key={i} />)}</div>
              ) : (
                <>
                  <ScrollSection title="🔥 Trending This Week" movies={trending} onPlay={handlePlay} onDetail={handleDetail} onMore={() => go("movies")} />
                  <ScrollSection title="⭐ Top Rated" movies={topRated} onPlay={handlePlay} onDetail={handleDetail} onMore={() => go("movies")} />
                  <ScrollSection title="📺 Popular TV Shows" movies={tvPopular} onPlay={handlePlay} onDetail={handleDetail} onMore={() => go("tv")} />
                  <ScrollSection title="🎬 Popular Now" movies={popular} onPlay={handlePlay} onDetail={handleDetail} onMore={() => go("movies")} />
                </>
              )}
            </div>
          </>
        );
      case "movies":
        return <ListPage title="Movies" type="movie" onPlay={handlePlay} onDetail={handleDetail} />;
      case "tv":
        return <ListPage title="TV Shows" type="tv" onPlay={handlePlay} onDetail={handleDetail} />;
      case "watchlist":
        return <WatchlistPage onPlay={handlePlay} onDetail={handleDetail} />;
      case "genre":
        return <GenrePage genreId={nav.genreId} onPlay={handlePlay} onDetail={handleDetail} />;
      case "search":
        return <SearchPage query={nav.query} onPlay={handlePlay} onDetail={handleDetail} />;
      case "detail":
        return <DetailPage movieId={nav.movieId} movieType={nav.movieType} onPlay={handlePlay} onDetail={handleDetail} onBack={() => go("home")} />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className={`mobile-menu ${mobileMenu ? "open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span className="logo" onClick={() => go("home")}>CINEMAX</span>
          <button style={{ background: "none", border: "none", color: G.text, fontSize: "1.4rem", cursor: "pointer" }} onClick={() => setMobileMenu(false)}>✕</button>
        </div>
        <NavLinks mobile />
        <div style={{ marginTop: 16 }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
            <input className="search-input" style={{ flex: 1, width: "auto" }} placeholder="Search…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            <button className="btn btn-red" type="submit">Go</button>
          </form>
        </div>
        <div style={{ marginTop: 24 }}>
          <p style={{ color: G.muted, fontSize: ".75rem", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Genres</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {GENRES.map(g => (
              <button key={g.id} className="genre-chip" onClick={() => go("genre", { genreId: g.id })}>
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-inner">
          <span className="logo" onClick={() => go("home")}>CINEMAX</span>
          <div className="nav-links"><NavLinks /></div>
          <div className="search-wrap">
            <form onSubmit={handleSearch} style={{ position: "relative" }}>
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search movies, shows…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            </form>
          </div>
          <button className="hamburger" onClick={() => setMobileMenu(true)}>☰</button>
        </div>
        <div className="genre-bar">
          <div className="genre-scroll">
            {GENRES.map(g => (
              <button
                key={g.id}
                className={`genre-chip ${nav.page === "genre" && nav.genreId === g.id ? "active" : ""}`}
                onClick={() => go("genre", { genreId: g.id })}
              >
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mobile-search">
        <form onSubmit={handleSearch} style={{ position: "relative" }}>
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search movies, shows…" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        </form>
      </div>

      <main style={{ minHeight: "80vh" }}>{renderPage()}</main>

      <footer style={{ background: G.surface, borderTop: `1px solid ${G.border}`, padding: "28px clamp(14px,4vw,56px)", marginTop: 20 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <span className="logo" style={{ fontSize: "1.4rem" }}>CINEMAX</span>
            <p style={{ color: G.muted, fontSize: ".75rem", marginTop: 6 }}>Watch movies & TV shows online for free.</p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["Home", "Movies", "TV Shows", "Watchlist"].map(l => (
              <span key={l} className="nav-link" onClick={() => go(l.toLowerCase().replace(" ", ""))}>{l}</span>
            ))}
          </div>
          <p style={{ color: G.muted, fontSize: ".72rem", maxWidth: 340 }}>
            This site does not host any files. All content is provided by non-affiliated third parties.
          </p>
        </div>
      </footer>

      {playing && <PlayerModal movie={playing} type={playType} onClose={() => setPlaying(null)} />}
    </>
  );
}