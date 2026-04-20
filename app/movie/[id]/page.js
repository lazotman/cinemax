import MovieDetailClient from './client';

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

async function getMovie(id) {
  try {
    const res = await fetch(
      `${TMDB}/movie/${id}?api_key=${TMDB_KEY}`,
      { next: { revalidate: 3600 } }
    );
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const movie = await getMovie(id);
  if (!movie || movie.status_code) {
    return { title: 'Movie Not Found | CINEMAX' };
  }
  return {
    title: `${movie.title} (${movie.release_date?.slice(0, 4)}) | CINEMAX`,
    description: movie.overview?.slice(0, 160),
    openGraph: {
      title: movie.title,
      description: movie.overview?.slice(0, 160),
      images: movie.backdrop_path
        ? [`${IMG}/w1280${movie.backdrop_path}`]
        : [],
    },
  };
}

export default async function MoviePage({ params }) {
  const { id } = await params;
  return <MovieDetailClient id={id} type="movie" />;
}
