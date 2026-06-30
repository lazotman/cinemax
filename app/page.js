"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SocialShare from "./components/SocialShare";
// أضف هذا
import { useRouter } from "next/navigation";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const SITE_NAME = "CINEMAX";
const SITE_URL = "https://cine-max.live";

// ✅ Cache دائم بـ sessionStorage — يبقى بين navigations (5 دقائق)
// بدل Map() التي تُعاد كل تحميل للصفحة
const CACHE_TTL = 5 * 60 * 1000;

const api = async (path, params = {}) => {
  const u = new URL(`${TMDB}${path}`);
  u.searchParams.set("api_key", TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  const key = "cx_" + u.toString();

  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch {}

  const r = await fetch(u);
  const data = await r.json();

  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}

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
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  card: 'var(--card)',
  border: 'var(--border)',
  accent: 'var(--accent)',
  accentHover: 'var(--accent-hover)',
  gold: 'var(--gold)',
  text: 'var(--text)',
  muted: 'var(--muted)',
  soft: 'var(--soft)',
  font: 'var(--font-bebas), Oswald, sans-serif',
  body: 'var(--font-dm), DM Sans, sans-serif',
  radius: '12px',
};

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const CSS = ``;

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

// ✅ إصلاح CLS في Hero — نحجز المساحة قبل تحميل الصورة
// وأضفنا preload link ديناميكي لتسريع LCP
const Hero = ({ movie, onPlay, onDetail }) => {
  const bgUrl = movie?.backdrop_path ? `${IMG}/w1280${movie.backdrop_path}` : null;

  useEffect(() => {
    if (!bgUrl) return;
    // ✅ preload الصورة الرئيسية فور معرفة الـ URL
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = bgUrl;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, [bgUrl]);

  if (!movie) return (
    // ✅ placeholder بنفس الارتفاع يمنع CLS حتى تتحمل بيانات الـ hero
    <div className="hero" style={{ background: G.surface }} />
  );

  return (
    <div className="hero">
      {/* ✅ fetchPriority="high" + decoding="async" لأسرع عرض ممكن */}
      {bgUrl && (
        <img
          className="hero-bg"
          src={bgUrl}
          alt=""
          width={1280}
          height={720}
          fetchPriority="high"
          decoding="async"
        />
      )}
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
                <SocialShare title={data.title || data.name} url={`https://cine-max.live/${type}/${data.id}`} />
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
  const router = useRouter();

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
  router.push(`/${type}/${movie.id}`);
}, [router]);

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