'use client'

import { useState } from 'react'
import type { SearchResults } from '@/lib/algolia'
import { copyShareLink } from '@/lib/share'

interface ComparisonSnapshot {
  dateDisplay: string
  year: number
  results: SearchResults
}

interface ComparisonPanelProps {
  base: ComparisonSnapshot
  compare: ComparisonSnapshot
  onClose: () => void
  onSwap: () => void
}

function formatSong(results: SearchResults): string {
  const song = results.songs[0]
  return song ? `#${song.chart_position} "${song.song_title}" - ${song.artist}` : 'No song data'
}

function formatMovie(results: SearchResults): string {
  const movie = results.movies[0]
  return movie ? `${movie.title} (${movie.vote_average.toFixed(1)}/10)` : 'No movie data'
}

function formatGas(results: SearchResults): string {
  const price = results.prices[0]
  return price?.gas_price_gallon !== undefined
    ? `$${price.gas_price_gallon.toFixed(2)}/gallon`
    : 'No gas data'
}

function formatEvent(results: SearchResults): string {
  const event = results.events[0]
  return event ? event.title : 'No event data'
}

function getGasDelta(base: SearchResults, compare: SearchResults): string | null {
  const baseGas = base.prices[0]?.gas_price_gallon
  const compareGas = compare.prices[0]?.gas_price_gallon
  if (baseGas === undefined || compareGas === undefined) return null

  const diff = compareGas - baseGas
  const direction = diff > 0 ? 'higher' : diff < 0 ? 'lower' : 'the same'
  if (direction === 'the same') return 'Gas prices are the same in both snapshots.'

  return `Gas is $${Math.abs(diff).toFixed(2)} ${direction} in ${compare.prices[0]?.year}.`
}

function getMovieDelta(base: SearchResults, compare: SearchResults): string | null {
  const baseRating = base.movies[0]?.vote_average
  const compareRating = compare.movies[0]?.vote_average
  if (baseRating === undefined || compareRating === undefined) return null

  const diff = compareRating - baseRating
  if (Math.abs(diff) < 0.01) return 'Top movie ratings are effectively equal.'

  const direction = diff > 0 ? 'higher' : 'lower'
  return `Top movie rating is ${Math.abs(diff).toFixed(1)} points ${direction} in the comparison year.`
}

function buildComparisonSummary(base: ComparisonSnapshot, compare: ComparisonSnapshot): string {
  return [
    `TimeSlipSearch comparison: ${base.dateDisplay} vs ${compare.dateDisplay}`,
    '',
    `${base.year} snapshot`,
    `- Song: ${formatSong(base.results)}`,
    `- Movie: ${formatMovie(base.results)}`,
    `- Gas: ${formatGas(base.results)}`,
    `- Event: ${formatEvent(base.results)}`,
    '',
    `${compare.year} snapshot`,
    `- Song: ${formatSong(compare.results)}`,
    `- Movie: ${formatMovie(compare.results)}`,
    `- Gas: ${formatGas(compare.results)}`,
    `- Event: ${formatEvent(compare.results)}`,
    '',
    '- Explore: https://timeslipsearch.vercel.app',
  ].join('\n')
}

export function ComparisonPanel({ base, compare, onClose, onSwap }: ComparisonPanelProps) {
  const [status, setStatus] = useState('')
  const yearGap = Math.abs(compare.year - base.year)
  const gasDelta = getGasDelta(base.results, compare.results)
  const movieDelta = getMovieDelta(base.results, compare.results)

  const handleCopyComparison = async () => {
    const text = buildComparisonSummary(base, compare)
    const copied = await copyShareLink(text)
    setStatus(copied ? '\u2713 Comparison copied!' : '\u2717 Failed to copy comparison')
    setTimeout(() => setStatus(''), 3000)
  }

  return (
    <section className="mb-8 glass-card border border-phosphor-teal/30 rounded p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="led-text text-phosphor-teal text-xs tracking-[0.25em]">COMPARE MODE</p>
          <h3 className="font-display text-2xl text-aged-cream">
            {base.year} vs {compare.year}
          </h3>
          <p className="text-aged-cream/60 text-sm">Year gap: {yearGap} years</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSwap}
            className="px-3 py-2 text-sm led-text tracking-wider bg-crt-dark border border-phosphor-amber/40 rounded hover:border-phosphor-amber"
          >
            Swap
          </button>
          <button
            onClick={handleCopyComparison}
            className="px-3 py-2 text-sm led-text tracking-wider bg-crt-dark border border-phosphor-teal/40 rounded hover:border-phosphor-teal"
          >
            Copy
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm led-text tracking-wider bg-crt-dark border border-crt-light/40 rounded hover:border-crt-light"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <article className="bg-crt-dark border border-phosphor-teal/25 rounded p-3 space-y-2">
          <p className="led-text text-phosphor-teal text-xs tracking-widest">{base.dateDisplay}</p>
          <p className="text-aged-cream text-sm">Song: {formatSong(base.results)}</p>
          <p className="text-aged-cream text-sm">Movie: {formatMovie(base.results)}</p>
          <p className="text-aged-cream text-sm">Gas: {formatGas(base.results)}</p>
          <p className="text-aged-cream text-sm">Event: {formatEvent(base.results)}</p>
        </article>
        <article className="bg-crt-dark border border-phosphor-amber/25 rounded p-3 space-y-2">
          <p className="led-text text-phosphor-amber text-xs tracking-widest">{compare.dateDisplay}</p>
          <p className="text-aged-cream text-sm">Song: {formatSong(compare.results)}</p>
          <p className="text-aged-cream text-sm">Movie: {formatMovie(compare.results)}</p>
          <p className="text-aged-cream text-sm">Gas: {formatGas(compare.results)}</p>
          <p className="text-aged-cream text-sm">Event: {formatEvent(compare.results)}</p>
        </article>
      </div>

      <div className="mt-4 space-y-1 text-sm text-aged-cream/80">
        {gasDelta && <p>{gasDelta}</p>}
        {movieDelta && <p>{movieDelta}</p>}
      </div>

      {status && (
        <p className="mt-3 text-xs text-phosphor-teal led-text tracking-wider">{status}</p>
      )}
    </section>
  )
}
