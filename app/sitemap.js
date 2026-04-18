export default async function sitemap() {
  const TMDB_KEY = "9e1ddea24e6d93bc9571c7b18c0cf493";
  const BASE = "https://cine-max.live";

  const static_pages = [
    { url: BASE, lastModified: new Date(), priority: 1 },
    { url: `${BASE}/movies`, lastModified: new Date(), priority: 0.8 },
    { url: `${BASE}/tv`, lastModified: new Date(), priority: 0.8 },
  ];

  try {
    const results = await Promise.all([
      ...Array.from({length: 10}, (_, i) =>
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=${i+1}`, {cache: 'no-store'}).then(r=>r.json())
      ),
      ...Array.from({length: 10}, (_, i) =>
        fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&page=${i+1}`, {cache: 'no-store'}).then(r=>r.json())
      ),
    ]);

    const movie_urls = results.slice(0,10).flatMap(p=>(p.results||[]).map(m=>({
      url: `${BASE}/movie/${m.id}`,
      lastModified: new Date(),
      priority: 0.7,
    })));

    const tv_urls = results.slice(10).flatMap(p=>(p.results||[]).map(s=>({
      url: `${BASE}/tv/${s.id}`,
      lastModified: new Date(),
      priority: 0.7,
    })));

    return [...static_pages, ...movie_urls, ...tv_urls];
  } catch {
    return static_pages;
  }
}