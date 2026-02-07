import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About TimeSlipSearch Cultural Time Machine',
  description: 'Learn how TimeSlipSearch works, where the data comes from, and how this date-based history engine helps people explore culture and context.',
}

export default function AboutPage() {
  const siteUrl = 'https://timeslipsearch.vercel.app'
  const publishedDate = '2026-01-15'
  const modifiedDate = '2026-02-07'
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'About TimeSlipSearch',
    description: 'Learn how TimeSlipSearch works and how date-based cultural search is built and sourced.',
    image: `${siteUrl}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: 'TimeSlipSearch Editorial Team',
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    mainEntityOfPage: `${siteUrl}/about`,
    publisher: {
      '@type': 'Organization',
      name: 'TimeSlipSearch',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon`,
      },
    },
  }

  return (
    <main className="min-h-screen bg-crt-black text-aged-cream">
      <div className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-5xl tracking-tight">About TimeSlipSearch</h1>
          <p className="text-aged-cream/75">
            TimeSlipSearch is a date-first cultural search experience that helps you explore what the world looked like on a specific day between 1958 and 2020.
          </p>
          <p className="text-sm text-aged-cream/70 led-text tracking-wide">
            By TimeSlipSearch Editorial Team · Published <time dateTime={publishedDate}>January 15, 2026</time> · Updated <time dateTime={modifiedDate}>February 7, 2026</time>
          </p>
        </header>

        <section className="space-y-4 text-aged-cream/80 leading-relaxed">
          <p>
            The goal is simple: enter a date and get a useful historical snapshot in seconds. For each query, the app combines chart data, movie releases, historical price context, and notable events into one response. This makes it easier to compare life across eras and revisit the cultural context around personal milestones.
          </p>
          <p>
            TimeSlipSearch was built for the Algolia Agent Studio Challenge 2026 and is designed to feel fast, playful, and information-dense. Under the hood, the app indexes multiple datasets and uses natural language date parsing so users can type flexible queries such as specific dates, seasons, and year-based prompts.
          </p>
          <p>
            Primary data comes from public and licensed sources, including Billboard history, The Movie Database, Wikimedia event feeds, and FRED economic indicators. We continuously improve source quality, matching logic, and result presentation so each date tells a clearer story.
          </p>
          <p>
            We prioritize transparent sourcing and reproducibility. Music rankings are anchored in public chart references. Historical events use curated encyclopedia and feed sources with date-level granularity. Economic data draws from trusted public datasets designed for historical analysis. Wherever possible, we normalize source timestamps and formats so users can compare across domains without manually translating dates, categories, or units.
          </p>
          <p>
            If you are curious about how this kind of timeline data is commonly structured, documentation from{' '}
            <a className="underline hover:text-phosphor-teal" href="https://developer.themoviedb.org/docs" target="_blank" rel="noopener noreferrer">
              The Movie Database API
            </a>{' '}
            and the{' '}
            <a className="underline hover:text-phosphor-teal" href="https://fred.stlouisfed.org/docs/api/fred/" target="_blank" rel="noopener noreferrer">
              FRED API
            </a>{' '}
            are useful references. TimeSlipSearch builds a user-facing layer over these raw historical inputs so people can explore dates naturally.
          </p>
          <p>
            We treat this project as an evolving research product rather than a static archive. As we collect feedback, we refine parsing accuracy, enrich context in responses, and improve accessibility for keyboard and assistive-technology users. If you spot gaps or inaccuracies, contact us so we can fix and document them.
          </p>
        </section>

        <footer className="flex gap-5 text-sm led-text tracking-wider">
          <Link href="/" className="hover:text-phosphor-teal transition-colors">HOME</Link>
          <Link href="/contact" className="hover:text-phosphor-teal transition-colors">CONTACT</Link>
          <Link href="/privacy-policy" className="hover:text-phosphor-teal transition-colors">PRIVACY POLICY</Link>
        </footer>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </main>
  )
}
