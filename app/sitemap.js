const TMDB_KEY = "9e1ddea24e6d93bc9571c7b18c0cf493";

export default async function sitemap() {
  // Static pages
  const static_pages = [
    { url: 'https://cine-max.live', lastModified: new Date(), priority: 1 },
    { url: 'https://cine-max.live/movies', lastModified: new Date(), priority: 0.8 },
    { url: 'https://cine-max.live/tv', lastModified: new Date(), priority: 0.8 },
  ];

  // Fetch popular movies (500 movies = 5 pages)
  const moviePages = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=${i + 1}`)
        .then(r => r.json())
    )
  );

  // Fetch popular TV shows
  const tvPages = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&page=${i + 1}`)
        .then(r => r.json())
    )
  );

  const movies = moviePages.flatMap(p => p.results || []).map(m => ({
    url: `https://cine-max.live/movie/${m.id}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const shows = tvPages.flatMap(p => p.results || []).map(s => ({
    url: `https://cine-max.live/tv/${s.id}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [...static_pages, ...movies, ...shows];
}