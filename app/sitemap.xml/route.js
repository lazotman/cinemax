export async function GET() {
  const TMDB_KEY = "9e1ddea24e6d93bc9571c7b18c0cf493";
  const BASE = "https://cine-max.live";

  const [moviesRes, tvRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=1`).then(r=>r.json()),
    fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&page=1`).then(r=>r.json()),
  ]);

  const movies = (moviesRes.results||[]).map(m=>`<url><loc>${BASE}/movie/${m.id}</loc><priority>0.7</priority></url>`).join('');
  const tv = (tvRes.results||[]).map(s=>`<url><loc>${BASE}/tv/${s.id}</loc><priority>0.7</priority></url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${BASE}</loc><priority>1</priority></url>
<url><loc>${BASE}/movies</loc><priority>0.8</priority></url>
<url><loc>${BASE}/tv</loc><priority>0.8</priority></url>
${movies}${tv}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}