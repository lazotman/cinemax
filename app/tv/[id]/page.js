import TVDetailClient from './client';

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

async function getShow(id) {
  try {
    const res = await fetch(
      `${TMDB}/tv/${id}?api_key=${TMDB_KEY}`,
      { next: { revalidate: 3600 } }
    );
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const show = await getShow(id);
  if (!show || show.status_code) return { title: 'Show Not Found | CINEMAX' };
  return {
    title: `${show.name} (${show.first_air_date?.slice(0, 4)}) | CINEMAX`,
    description: show.overview?.slice(0, 160),
    keywords: `watch ${show.name} online free, ${show.name} streaming, ${show.name} all seasons`,
    openGraph: {
      title: show.name,
      description: show.overview?.slice(0, 160),
      images: show.backdrop_path ? [`${IMG}/w1280${show.backdrop_path}`] : [],
    },
  };
}

export default async function TVPage({ params }) {
  const { id } = await params;
  return <TVDetailClient id={id} type="tv" />;
}