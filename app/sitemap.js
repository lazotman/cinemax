export const fetchCache = 'force-no-store'

export default async function sitemap() {
  const KEY = "dba50d3bc9d248fb90e8cbe17403ffe7"
  const BASE = "https://cine-max.live"

  try {
    const [m, t] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${KEY}&page=1`, { cache: 'no-store' }).then(r=>r.json()),
      fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${KEY}&page=1`, { cache: 'no-store' }).then(r=>r.json()),
    ])

    const movies = (m.results||[]).map(x=>({ url:`${BASE}/movie/${x.id}`, priority:0.7 }))
    const shows = (t.results||[]).map(x=>({ url:`${BASE}/tv/${x.id}`, priority:0.7 }))

    return [
      { url: BASE, priority: 1 },
      { url: `${BASE}/movies`, priority: 0.8 },
      { url: `${BASE}/tv`, priority: 0.8 },
      ...movies,
      ...shows,
    ]
  } catch {
    return [{ url: BASE, priority: 1 }]
  }
}