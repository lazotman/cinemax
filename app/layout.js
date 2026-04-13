export const metadata = {
  title: 'CINEMAX — Watch Free Movies & TV Shows Online',
  description: 'Watch the latest movies and TV shows free online on CINEMAX.',
  keywords: 'watch movies online free, free streaming, CINEMAX',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}