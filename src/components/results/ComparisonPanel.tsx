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

  const lines = (snap: ComparisonSnapshot) => [
    ['Song', formatSong(snap.results)],
    ['Movie', formatMovie(snap.results)],
    ['Gas', formatGas(snap.results)],
    ['Event', formatEvent(snap.results)],
  ] as const

  return (
    <section aria-label="Comparison" className="ed-sheet mb-8 px-5 py-6 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-ink pb-4">
        <div>
          <p className="ed-label text-edition">Side by side</p>
          <h3 className="font-display text-3xl italic">
            {base.year} vs {compare.year}
          </h3>
          <p className="ed-label text-faded">{yearGap} years apart</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSwap} className="ed-btn">Swap</button>
          <button type="button" onClick={handleCopyComparison} className="ed-btn">Copy</button>
          <button type="button" onClick={onClose} className="ed-btn">Close</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {[base, compare].map((snap, i) => (
          <article key={snap.dateDisplay + i} className={`py-4 ${i === 0 ? 'md:border-r md:border-ink md:pr-8' : 'border-t border-ink md:border-t-0 md:pl-8'}`}>
            <h4 className="ed-label border-b-2 border-ink pb-2">{snap.dateDisplay}</h4>
            <dl>
              {lines(snap).map(([k, v]) => (
                <div key={k} className="border-b border-ink/25 py-2">
                  <dt className="ed-label text-faded">{k}</dt>
                  <dd className="font-display text-lg">{v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="space-y-1 border-t border-ink pt-4 font-body text-base">
        {gasDelta && <p>{gasDelta}</p>}
        {movieDelta && <p>{movieDelta}</p>}
      </div>

      {status && (
        <p role="status" className="mt-3 ed-label text-edition">{status}</p>
      )}
    </section>
  )
}
