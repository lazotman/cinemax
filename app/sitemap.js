export const fetchCache = 'force-no-store'

export default async function sitemap() {
  const KEY = process.env.NEXT_PUBLIC_TMDB_KEY
  const BASE = "https://cine-max.live"

  const static_pages = [
    { url: BASE, priority: 1 },
    { url: `${BASE}/movies`, priority: 0.8 },
    { url: `${BASE}/tv`, priority: 0.8 },
  ]

  try {
    // 20 صفحة = 400 فيلم + 400 مسلسل = 800 رابط
    const [movieResults, tvResults] = await Promise.all([
      Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${KEY}&page=${i + 1}`, { cache: 'no-store' }).then(r => r.json())
        )
      ),
      Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${KEY}&page=${i + 1}`, { cache: 'no-store' }).then(r => r.json())
        )
      ),
    ])

    const movies = movieResults
      .flatMap(p => p.results || [])
      .map(m => ({ url: `${BASE}/movie/${m.id}`, priority: 0.7 }))

    const shows = tvResults
      .flatMap(p => p.results || [])
      .map(s => ({ url: `${BASE}/tv/${s.id}`, priority: 0.7 }))

    return [...static_pages, ...movies, ...shows]
  } catch {
    return static_pages
  }
}