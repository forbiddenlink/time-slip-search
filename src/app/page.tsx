import Link from 'next/link'
import { Suspense } from 'react'
import HomeClient from '@/components/home/HomeClient'

function HomeSeoFallback() {
  const publishedDate = '2026-01-15'
  const modifiedDate = '2026-02-07'

  return (
    <main className="min-h-screen bg-crt-black text-aged-cream">
      <div className="container mx-auto max-w-4xl px-4 py-10 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-none">
            TimeSlipSearch
          </h1>
          <p className="text-aged-cream/80 max-w-2xl mx-auto">
            Discover what happened on any day from 1958 to 2020, including the #1 song, top movies in theaters, historical prices, and key global events.
          </p>
          <p className="text-sm text-aged-cream/60 led-text tracking-wide">
            By TimeSlipSearch Editorial Team · Published <time dateTime={publishedDate}>January 15, 2026</time> · Updated <time dateTime={modifiedDate}>February 7, 2026</time>
          </p>
          <nav className="flex items-center justify-center gap-4 text-sm led-text tracking-wider">
            <Link href="/about" className="hover:text-phosphor-teal transition-colors">ABOUT</Link>
            <Link href="/contact" className="hover:text-phosphor-teal transition-colors">CONTACT</Link>
            <Link href="/privacy-policy" className="hover:text-phosphor-teal transition-colors">PRIVACY POLICY</Link>
          </nav>
        </header>

        <article className="space-y-4 text-aged-cream/80 leading-relaxed">
          <p>
            TimeSlipSearch is a date-based history and culture explorer built for people who want to reconnect with a specific moment in time. You can enter a birthday, a graduation date, a major news date, or even a broad era like the summer of 1969. The app then assembles an instant snapshot from that date, combining music charts, films, economic context, and notable events so you can understand what daily life and pop culture looked like at that exact point in history.
          </p>
          <p>
            Our music timeline starts in 1958 with the Billboard Hot 100 and tracks top songs across decades. For movies, we surface theatrical releases around your selected date to show what audiences were watching. We also include historical price points such as gas, wages, and inflation context, helping you compare everyday costs across generations. Finally, we layer in notable events to place each search in social and historical context rather than showing isolated facts.
          </p>
          <p>
            This project is designed for fast exploration and easy comparison. You can jump between dates, explore different years, and quickly share what you find with friends and family. Whether you are researching family milestones, creating nostalgia content, or simply satisfying curiosity, TimeSlipSearch offers a compact way to experience cultural history through a single date query.
          </p>
          <p>
            Data sources include public references such as the{' '}
            <a className="underline hover:text-phosphor-teal" href="https://www.billboard.com/charts/hot-100/" target="_blank" rel="noopener noreferrer">
              Billboard Hot 100
            </a>{' '}
            and the{' '}
            <a className="underline hover:text-phosphor-teal" href="https://api.wikimedia.org/wiki/Feed_API/Reference/On_this_day" target="_blank" rel="noopener noreferrer">
              Wikimedia On This Day feed
            </a>
            .
          </p>
          <p>
            TimeSlipSearch is useful for family history projects, classroom timeline activities, nostalgia newsletters, and creative research. The experience is intentionally lightweight: type a date, review a concise cultural snapshot, and follow links to broader context. As we expand coverage and improve ranking quality, we continue refining source attribution, date parsing, and comparison workflows so each result remains both entertaining and trustworthy.
          </p>
        </article>
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSeoFallback />}>
      <HomeClient />
    </Suspense>
  )
}
