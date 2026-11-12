import { Suspense } from 'react'
import { headers } from 'next/headers'
import HomeClient from '@/components/home/HomeClient'

const siteUrl = 'https://timeslipsearch.vercel.app'
const publishedDate = '2026-01-15'
const modifiedDate = '2026-02-07'

function HomeSeoFallback() {
  return (
    <main className="min-h-screen bg-ink text-newsprint">
      <div className="container mx-auto max-w-4xl px-4 py-10 space-y-8">
        <header className="ed-sheet px-5 py-6 text-center md:px-10">
          <h1 className="font-nameplate text-[clamp(3rem,10vw,7rem)] leading-none">TimeSlip Search</h1>
          <div className="mt-3 h-[7px] border-b border-t-[3px] border-ink" aria-hidden="true" />
          <p className="mt-3 font-display text-lg italic">
            The #1 song, the movies, the prices and the headlines from any day you pick.
          </p>
        </header>

        <div className="sr-only">
          <article className="space-y-4 text-newsprint/90 leading-relaxed">
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
              <a className="underline hover:text-white" href="https://www.billboard.com/charts/hot-100/" target="_blank" rel="noopener noreferrer">
                Billboard Hot 100
              </a>{' '}
              and the{' '}
              <a className="underline hover:text-white" href="https://api.wikimedia.org/wiki/Feed_API/Reference/On_this_day" target="_blank" rel="noopener noreferrer">
                Wikimedia On This Day feed
              </a>
              .
            </p>
            <p>
              TimeSlipSearch is useful for family history projects, classroom timeline activities, nostalgia newsletters, and creative research. The experience is intentionally lightweight: type a date, review a concise cultural snapshot, and follow links to broader context. As we expand coverage and improve ranking quality, we continue refining source attribution, date parsing, and comparison workflows so each result remains both entertaining and trustworthy.
            </p>
          </article>
        </div>

        <div className="ed-sheet h-64 opacity-60" aria-hidden="true" />
      </div>
    </main>
  )
}

export default async function HomePage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'TimeSlipSearch',
    description: 'Search any date from 1958 to 2020 to instantly see the #1 song, top movies, historical prices, and major events.',
    url: siteUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Organization',
      name: 'Elizabeth Stein',
    },
  }

  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Suspense fallback={<HomeSeoFallback />}>
        <HomeClient />
      </Suspense>
    </>
  )
}
