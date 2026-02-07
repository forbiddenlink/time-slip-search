import type { Metadata } from 'next'
import { Playfair_Display, Source_Serif_4, VT323, Special_Elite } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-led',
  display: 'swap',
})

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-typewriter',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://timeslipsearch.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TimeSlipSearch - What Was #1 On Your Birthday?',
    template: '%s | TimeSlipSearch',
  },
  description: 'Search any date from 1958 to 2020 to instantly see the #1 song, top movies, historical prices, and major events from that day in history.',
  keywords: ['birthday song', 'what was number 1', 'nostalgia', 'history', 'time machine', 'birthday lookup', 'Billboard Hot 100', '80s music', '90s movies', 'historical prices', 'Algolia'],
  authors: [{ name: 'TimeSlipSearch' }],
  creator: 'TimeSlipSearch',
  openGraph: {
    title: 'What Was #1 The Day You Were Born?',
    description: 'Search any date from 1958 to 2020 to instantly see the #1 song, top movies, historical prices, and major events from that day.',
    url: siteUrl,
    siteName: 'TimeSlipSearch',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Was #1 The Day You Were Born?',
    description: 'Search any date from 1958 to 2020 to instantly see the #1 song, top movies, historical prices, and major events from that day.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${vt323.variable} ${specialElite.variable}`}>
      <head>
        <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
      </head>
      <body className="font-body antialiased">
        {/* Global grain overlay for that analog feel */}
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
