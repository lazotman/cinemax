"use client";

import { useState, useEffect } from "react";
import SocialShare from "../../../components/SocialShare";
import { useRouter } from "next/navigation";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const SITE_NAME = "CINEMAX";

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

const CSS = ``;

const CACHE_TTL = 5 * 60 * 1000;

const api = async (path) => {
  const url = `${TMDB}${path}?api_key=${TMDB_KEY}`;
  const key = "cx_" + url;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch {}
  const r = await fetch(url);
  const data = await r.json();
  try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
  return data;
};

const embedUrl = (id, type) => `https://vidsrc.me/embed/${type}?tmdb=${id}`;

const WL_KEY = "cinemax_watchlist";
const getWL = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); } catch { return []; } };
const saveWL = (list) => localStorage.setItem(WL_KEY, JSON.stringify(list));

const RatingBadge = ({ v }) => <span className="rating">★ {Number(v || 0).toFixed(1)}</span>;

const PlayerModal = ({ movie, type, onClose }) => (
  <div className="modal-bg" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>✕ Close Player</button>
      <div className="iframe-wrap">
        <div className="iframe-ratio">
          <iframe src={embedUrl(movie.id, type)} allowFullScreen referrerPolicy="origin" title={movie.title || movie.name} />
        </div>
        <div className="modal-info">
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge" style={{ background: type === "tv" ? "#0066ff" : G.accent }}>{type === "tv" ? "TV Show" : "Movie"}</span>
            <span style={{ fontFamily: G.font, fontSize: "1.2rem", letterSpacing: 1 }}>{movie.title || movie.name}</span>
            <RatingBadge v={movie.vote_average} />
          </div>
          {movie.overview && <p style={{ color: G.muted, fontSize: ".8rem", marginTop: 8, lineHeight: 1.6 }}>{movie.overview.slice(0, 200)}…</p>}
        </div>
      </div>
    </div>
  </div>
);

const WatchlistBtn = ({ movie, type }) => {
  const [inWL, setInWL] = useState(() => getWL().some(m => m.id === movie.id));
  const toggle = () => {
    let wl = getWL();
    if (inWL) { wl = wl.filter(m => m.id !== movie.id); }
    else { wl = [{ ...movie, _type: type }, ...wl]; }
    saveWL(wl);
    setInWL(!inWL);
  };
  return (
    <button className={`btn btn-icon ${inWL ? "wl-btn-active" : ""}`} onClick={toggle} style={{ marginBottom: 12 }}>
      {inWL ? "✓ In Watchlist" : "+ Add to Watchlist"}
    </button>
  );
};

export default function MovieDetailClient({ id, type }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [related, setRelated] = useState([]);
  const [tab, setTab] = useState("overview");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
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
  }, [id, type]);

  if (!data) return (
    <>
      
      <nav className="nav"><div className="nav-inner"><span className="logo" onClick={() => router.push("/")}>CINEMAX</span></div></nav>
      <div className="spinner" />
    </>
  );

  const bg = data.backdrop_path ? `${IMG}/w1280${data.backdrop_path}` : null;
  const poster = data.poster_path ? `${IMG}/w500${data.poster_path}` : null;
  const cast = (credits?.cast || []).slice(0, 14);
  const trailer = videos[0];
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : data.episode_run_time?.[0] ? `${data.episode_run_time[0]}m/ep` : "";
  const genres = (data.genres || []).map(g => g.name).join(", ");

  return (
    <>
      

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <span className="logo" onClick={() => router.push("/")}>CINEMAX</span>
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back</button>
        </div>
      </nav>

      <div className="fade-in">
        {/* BACKDROP */}
        <div style={{ position: "relative", minHeight: 420, overflow: "hidden" }}>
          {bg && <img src={bg} alt="" width={1280} height={720} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: "brightness(.3)" }} />}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${G.bg} 0%,${G.bg}88 40%,transparent 100%)` }} />

          {/* DETAIL MAIN */}
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(14px,4vw,56px)" }}>
            <div style={{ position: "relative", zIndex: 1, paddingTop: "clamp(40px,6vw,80px)", display: "flex", gap: "clamp(20px,4vw,48px)", alignItems: "flex-start", flexWrap: "wrap" }}>
              {poster && (
                <img
                  src={poster}
                  alt={data.title || data.name}
                  width={500}
                  height={750}
                  style={{ width: "clamp(140px,18vw,240px)", flexShrink: 0, borderRadius: G.radius, boxShadow: "0 20px 60px rgba(0,0,0,.8)", border: `1px solid ${G.border}` }}
                />
              )}
              <div style={{ flex: 1, minWidth: 260 }}>
                <h1 style={{ fontFamily: G.font, fontSize: "clamp(1.8rem,5vw,3.5rem)", letterSpacing: 2, lineHeight: 1.05, marginBottom: 12 }}>
                  {data.title || data.name}
                </h1>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
                  <RatingBadge v={data.vote_average} />
                  {runtime && <span className="tag">{runtime}</span>}
                  <span className="tag">{(data.release_date || data.first_air_date || "").slice(0, 4)}</span>
                  {data.status && <span className="tag">{data.status}</span>}
                </div>
                {genres && <p style={{ color: G.muted, fontSize: ".8rem", marginBottom: 12 }}>{genres}</p>}
                <p style={{ color: G.soft, fontSize: "clamp(.875rem,1.5vw,1rem)", lineHeight: 1.8, marginBottom: 20 }}>{data.overview}</p>
                <WatchlistBtn movie={data} type={type} />
                <SocialShare title={data.title || data.name} url={`https://cine-max.live/${type}/${data.id}`} />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn btn-red" onClick={() => setPlaying(true)}>▶ Watch Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ maxWidth: 1400, margin: "32px auto 0", padding: "0 clamp(14px,4vw,56px) 60px" }}>
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
                <div>
                  <div className="trailer-wrap">
                    <div className="trailer-ratio">
                      <iframe src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`} allowFullScreen title={trailer.name} />
                    </div>
                  </div>
                  <p style={{ color: G.muted, fontSize: ".8rem", marginTop: 10 }}>{trailer.name}</p>
                </div>
              ) : <p style={{ color: G.muted }}>No trailer available.</p>}
            </div>
          )}

          {tab === "related" && (
            <div className="movie-grid fade-in">
              {related.map(m => {
                const t = m.first_air_date !== undefined ? "tv" : "movie";
                return (
                  <div key={m.id} className="movie-card" onClick={() => router.push(`/${t}/${m.id}`)}>
                    <div className="card-img-wrap">
                      {m.poster_path
                        ? <img src={`${IMG}/w342${m.poster_path}`} alt={m.title || m.name} loading="lazy" width={342} height={513} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", background: G.surface }}>🎬</div>
                      }
                    </div>
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div style={{ fontWeight: 600, fontSize: ".85rem", color: G.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title || m.name}</div>
                      <div style={{ fontSize: ".75rem", color: G.muted, marginTop: 3 }}>{(m.release_date || m.first_air_date || "").slice(0, 4)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {playing && <PlayerModal movie={data} type={type} onClose={() => setPlaying(false)} />}
    </>
  );
}
