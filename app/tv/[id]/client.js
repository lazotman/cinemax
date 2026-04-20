"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

const G = {
  bg: "#07090d", surface: "#0d1117", card: "#111820",
  border: "#1c2533", accent: "#e50914", accentHover: "#c2070f",
  gold: "#f5c518", text: "#eaeef2", muted: "#7a8fa6", soft: "#c0cdd8",
  font: "var(--font-bebas), 'Oswald', sans-serif",
  body: "var(--font-dm), 'DM Sans', sans-serif",
  radius: "10px",
};

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${G.bg};color:${G.text};font-family:${G.body};font-size:16px;line-height:1.5}
img{display:block;max-width:100%}
button{font-family:${G.body};cursor:pointer}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
.fade-in{animation:fadeIn .3s ease both}
.spinner{width:36px;height:36px;border:3px solid ${G.border};border-top-color:${G.accent};border-radius:50%;animation:spin .8s linear infinite;margin:80px auto}
.btn{border:none;border-radius:7px;font-weight:600;transition:all .18s;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;cursor:pointer}
.btn-red{background:${G.accent};color:#fff;padding:11px 22px;font-size:.875rem}
.btn-red:hover{background:${G.accentHover};transform:scale(1.02)}
.btn-ghost{background:rgba(255,255,255,.07);color:${G.text};border:1px solid ${G.border};padding:10px 20px;font-size:.875rem}
.btn-ghost:hover{background:rgba(255,255,255,.13)}
.btn-icon{background:rgba(255,255,255,.09);color:${G.text};border:1px solid ${G.border};padding:9px 14px;border-radius:8px;font-size:.8rem}
.btn-sm{padding:7px 14px;font-size:.78rem;border-radius:6px}
.badge{display:inline-block;background:#0066ff;color:#fff;font-size:.62rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:3px}
.rating{background:${G.gold};color:#000;font-weight:700;font-size:.72rem;padding:3px 8px;border-radius:4px;display:inline-flex;align-items:center;gap:3px}
.tag{background:${G.surface};border:1px solid ${G.border};color:${G.muted};padding:3px 9px;border-radius:4px;font-size:.75rem}
.tabs{display:flex;gap:0;border-bottom:1px solid ${G.border};margin-bottom:24px}
.tab{background:none;border:none;color:${G.muted};font-size:.875rem;font-weight:600;padding:10px 18px;border-bottom:2px solid transparent;transition:color .18s,border-color .18s;letter-spacing:.3px;cursor:pointer}
.tab.active{color:${G.text};border-bottom-color:${G.accent}}
.tab:hover{color:${G.soft}}
.nav{position:sticky;top:0;z-index:200;background:${G.bg}f0;backdrop-filter:blur(16px);border-bottom:1px solid ${G.border}}
.nav-inner{max-width:1400px;margin:0 auto;padding:0 clamp(14px,4vw,56px);height:60px;display:flex;align-items:center;gap:16px}
.logo{font-family:${G.font};font-size:1.75rem;letter-spacing:3px;color:${G.accent};cursor:pointer;user-select:none}
.movie-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px}
@media(min-width:480px){.movie-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}
@media(min-width:768px){.movie-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}}
.movie-card{border-radius:${G.radius};overflow:hidden;background:${G.card};border:1px solid ${G.border};cursor:pointer;transition:transform .22s ease,box-shadow .22s ease;position:relative}
.movie-card:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(0,0,0,.6)}
.card-img-wrap{position:relative;aspect-ratio:2/3;overflow:hidden;background:${G.surface}}
.card-img-wrap img{width:100%;height:100%;object-fit:cover}
.cast-grid{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.cast-grid::-webkit-scrollbar{display:none}
.cast-card{flex-shrink:0;width:90px;text-align:center}
.cast-photo{width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 6px;border:2px solid ${G.border};background:${G.surface}}
.cast-name{font-size:.72rem;font-weight:600;color:${G.text};line-height:1.3}
.cast-char{font-size:.68rem;color:${G.muted};margin-top:2px}
.trailer-wrap{border-radius:${G.radius};overflow:hidden;background:#000;max-width:800px}
.trailer-ratio{position:relative;padding-top:56.25%}
.trailer-ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
.modal-box{width:100%;max-width:1000px;position:relative}
.modal-close{position:absolute;top:-42px;right:0;background:none;border:none;color:${G.text};font-size:.85rem;font-weight:600;cursor:pointer;padding:8px;opacity:.8;display:flex;align-items:center;gap:6px}
.iframe-wrap{border-radius:${G.radius};overflow:hidden;background:#000}
.iframe-ratio{position:relative;padding-top:56.25%}
.iframe-ratio iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.modal-info{background:${G.surface};padding:14px 18px;border-top:1px solid ${G.border}}
.wl-btn-active{background:${G.accent}!important;border-color:${G.accent}!important;color:#fff!important}
.season-btn{background:${G.card};border:1px solid ${G.border};color:${G.muted};padding:7px 14px;border-radius:6px;font-size:.78rem;cursor:pointer;transition:all .18s;font-family:${G.body};font-weight:500}
.season-btn.active,.season-btn:hover{background:${G.accent};border-color:${G.accent};color:#fff}
.ep-scroll{display:flex;flex-wrap:wrap;gap:6px;max-height:120px;overflow-y:auto;scrollbar-width:thin}
`;

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

const WL_KEY = "cinemax_watchlist";
const getWL = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); } catch { return []; } };
const saveWL = (list) => localStorage.setItem(WL_KEY, JSON.stringify(list));

const RatingBadge = ({ v }) => <span className="rating">★ {Number(v || 0).toFixed(1)}</span>;

const WatchlistBtn = ({ movie }) => {
  const [inWL, setInWL] = useState(() => getWL().some(m => m.id === movie.id));
  const toggle = () => {
    let wl = getWL();
    if (inWL) { wl = wl.filter(m => m.id !== movie.id); }
    else { wl = [{ ...movie, _type: "tv" }, ...wl]; }
    saveWL(wl);
    setInWL(!inWL);
  };
  return (
    <button className={`btn btn-icon ${inWL ? "wl-btn-active" : ""}`} onClick={toggle} style={{ marginBottom: 12 }}>
      {inWL ? "✓ In Watchlist" : "+ Add to Watchlist"}
    </button>
  );
};

const PlayerModal = ({ show, season, episode, onClose }) => (
  <div className="modal-bg" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>✕ Close Player</button>
      <div className="iframe-wrap">
        <div className="iframe-ratio">
          <iframe
            src={`https://vidsrc.me/embed/tv?tmdb=${show.id}&season=${season}&episode=${episode}`}
            allowFullScreen
            referrerPolicy="origin"
            title={show.name}
          />
        </div>
        <div className="modal-info">
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="badge">TV SHOW</span>
            <span style={{ fontFamily: G.font, fontSize: "1.2rem", letterSpacing: 1 }}>{show.name}</span>
            <span className="tag">S{season} E{episode}</span>
            <RatingBadge v={show.vote_average} />
          </div>
          {show.overview && <p style={{ color: G.muted, fontSize: ".8rem", marginTop: 8, lineHeight: 1.6 }}>{show.overview.slice(0, 200)}…</p>}
        </div>
      </div>
    </div>
  </div>
);

export default function TVDetailClient({ id }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [related, setRelated] = useState([]);
  const [tab, setTab] = useState("overview");
  const [playing, setPlaying] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [episodeCount, setEpisodeCount] = useState(10);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api(`/tv/${id}`),
      api(`/tv/${id}/credits`),
      api(`/tv/${id}/videos`),
      api(`/tv/${id}/similar`),
    ]).then(([d, c, v, r]) => {
      setData(d);
      setCredits(c);
      setVideos((v.results || []).filter(x => x.site === "YouTube" && (x.type === "Trailer" || x.type === "Teaser")));
      setRelated((r.results || []).filter(x => x.poster_path).slice(0, 12));
      // Set episode count from first season
      const firstSeason = (d.seasons || []).find(s => s.season_number === 1);
      if (firstSeason) setEpisodeCount(firstSeason.episode_count || 10);
    });
  }, [id]);

  // Update episode count when season changes
  useEffect(() => {
    if (!data) return;
    const s = (data.seasons || []).find(x => x.season_number === season);
    if (s) setEpisodeCount(s.episode_count || 10);
    setEpisode(1);
  }, [season, data]);

  if (!data) return (
    <>
      <style>{CSS}</style>
      <nav className="nav"><div className="nav-inner"><span className="logo" onClick={() => router.push("/")}>CINEMAX</span></div></nav>
      <div className="spinner" />
    </>
  );

  const bg = data.backdrop_path ? `${IMG}/w1280${data.backdrop_path}` : null;
  const poster = data.poster_path ? `${IMG}/w500${data.poster_path}` : null;
  const cast = (credits?.cast || []).slice(0, 14);
  const trailer = videos[0];
  const genres = (data.genres || []).map(g => g.name).join(", ");
  const year = (data.first_air_date || "").slice(0, 4);
  const totalSeasons = data.number_of_seasons || 1;
  // Filter out season 0 (specials)
  const validSeasons = (data.seasons || []).filter(s => s.season_number > 0);

  return (
    <>
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <span className="logo" onClick={() => router.push("/")}>CINEMAX</span>
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>← Back</button>
          <span className="badge">TV SHOW</span>
        </div>
      </nav>

      <div className="fade-in">
        {/* BACKDROP */}
        <div style={{ position: "relative", minHeight: 420, overflow: "hidden" }}>
          {bg && <img src={bg} alt="" width={1280} height={720} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: "brightness(.3)" }} />}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top,${G.bg} 0%,${G.bg}88 40%,transparent 100%)` }} />

          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(14px,4vw,56px)" }}>
            <div style={{ position: "relative", zIndex: 1, paddingTop: "clamp(40px,6vw,80px)", display: "flex", gap: "clamp(20px,4vw,48px)", alignItems: "flex-start", flexWrap: "wrap" }}>
              {poster && (
                <img src={poster} alt={data.name} width={500} height={750}
                  style={{ width: "clamp(140px,18vw,240px)", flexShrink: 0, borderRadius: G.radius, boxShadow: "0 20px 60px rgba(0,0,0,.8)", border: `1px solid ${G.border}` }}
                />
              )}
              <div style={{ flex: 1, minWidth: 260 }}>
                <h1 style={{ fontFamily: G.font, fontSize: "clamp(1.8rem,5vw,3.5rem)", letterSpacing: 2, lineHeight: 1.05, marginBottom: 12 }}>
                  {data.name}
                </h1>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
                  <RatingBadge v={data.vote_average} />
                  {year && <span className="tag">{year}</span>}
                  <span className="tag">{totalSeasons} Season{totalSeasons > 1 ? "s" : ""}</span>
                  <span className="tag">{data.number_of_episodes} Episodes</span>
                  {data.status && <span className="tag">{data.status}</span>}
                </div>
                {genres && <p style={{ color: G.muted, fontSize: ".8rem", marginBottom: 12 }}>{genres}</p>}
                <p style={{ color: G.soft, fontSize: "clamp(.875rem,1.5vw,1rem)", lineHeight: 1.8, marginBottom: 20 }}>{data.overview}</p>

                {/* Season selector */}
                <div style={{ marginBottom: 14 }}>
                  <p style={{ color: G.muted, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Season</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {validSeasons.map(s => (
                      <button
                        key={s.season_number}
                        className={`season-btn ${season === s.season_number ? "active" : ""}`}
                        onClick={() => setSeason(s.season_number)}
                      >
                        S{s.season_number}
                      </button>
                    ))}
                  </div>

                  {/* Episode selector */}
                  <p style={{ color: G.muted, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Episode</p>
                  <div className="ep-scroll">
                    {Array.from({ length: episodeCount }, (_, i) => i + 1).map(e => (
                      <button
                        key={e}
                        className={`season-btn ${episode === e ? "active" : ""}`}
                        onClick={() => setEpisode(e)}
                      >
                        E{e}
                      </button>
                    ))}
                  </div>
                </div>

                <WatchlistBtn movie={data} />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                  <button className="btn btn-red" onClick={() => setPlaying(true)}>
                    ▶ Watch S{season}E{episode} Free
                  </button>
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
                ["Creator", (data.created_by || [])[0]?.name],
                ["Language", data.original_language?.toUpperCase()],
                ["Network", (data.networks || [])[0]?.name],
                ["Seasons", data.number_of_seasons],
                ["Episodes", data.number_of_episodes],
                ["Status", data.status],
              ].filter(([, v]) => v).map(([label, value]) => (
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
                    alt={c.name} loading="lazy" width={72} height={72}
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
              {related.map(m => (
                <div key={m.id} className="movie-card" onClick={() => router.push(`/tv/${m.id}`)}>
                  <div className="card-img-wrap">
                    {m.poster_path
                      ? <img src={`${IMG}/w342${m.poster_path}`} alt={m.name} loading="lazy" width={342} height={513} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", background: G.surface }}>📺</div>
                    }
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontWeight: 600, fontSize: ".85rem", color: G.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ fontSize: ".75rem", color: G.muted, marginTop: 3 }}>{(m.first_air_date || "").slice(0, 4)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SEO block */}
          <div style={{ marginTop: 48, padding: 24, background: G.card, borderRadius: 10, border: `1px solid ${G.border}` }}>
            <h2 style={{ fontFamily: G.font, fontSize: "1.3rem", letterSpacing: 1, marginBottom: 12 }}>
              Watch {data.name} ({year}) Online Free — All Seasons & Episodes
            </h2>
            <p style={{ color: G.muted, fontSize: ".875rem", lineHeight: 1.8 }}>
              Watch <strong style={{ color: G.text }}>{data.name}</strong> all seasons and episodes online free on CINEMAX.
              {data.overview ? ` ${data.overview.slice(0, 250)}` : ""}
              {genres ? ` Genre: ${genres}.` : ""}
              {` ${totalSeasons} seasons with ${data.number_of_episodes} episodes available in HD quality.`}
            </p>
          </div>
        </div>
      </div>

      {playing && <PlayerModal show={data} season={season} episode={episode} onClose={() => setPlaying(false)} />}
    </>
  );
}