/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'image.tmdb.org' },
    ],
  },
};

export default nextConfig;