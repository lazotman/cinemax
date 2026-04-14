import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'CINEMAX — Watch Free Movies & TV Shows Online',
  description: 'Watch the latest movies and TV shows free online on CINEMAX. Stream trending movies, top rated films and popular TV series.',
  keywords: 'watch movies online free, free streaming, movies, TV shows, series, CINEMAX',
  metadataBase: new URL('https://cine-max.live'),
  verification: {
    google: 'qt27q0OBKHn3Zj44aV6VpneQ-DJsMQsmoY1Sptmb05E',
  },
  openGraph: {
    title: 'CINEMAX — Watch Free Movies & TV Shows Online',
    description: 'Watch free movies and TV shows online on CINEMAX.',
    url: 'https://cine-max.live',
    siteName: 'CINEMAX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CINEMAX',
    description: 'Watch free movies and TV shows online.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}