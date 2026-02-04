'use client'

import { SearchResults } from '@/lib/algolia'
import { SongList } from './SongCard'
import { MovieList } from './MovieCard'
import { PriceCard, PriceComparison } from './PriceCard'
import { EventList } from './EventCard'

interface TimeCapsuleProps {
  results: SearchResults
  dateDisplay: string
  year: number
}

export function TimeCapsule({ results, dateDisplay, year }: TimeCapsuleProps) {
  const hasData =
    results.songs.length > 0 ||
    results.movies.length > 0 ||
    results.prices.length > 0 ||
    results.events.length > 0

  if (!hasData) {
    return (
      <div className="bg-crt-dark border border-crt-light/30 rounded p-6 text-center">
        <div className="led-text text-vhs-red text-sm tracking-widest mb-3">
          NO SIGNAL
        </div>
        <p className="text-aged-cream/80">
          I don&apos;t have much data for {dateDisplay} yet.
        </p>
        <p className="text-sm text-aged-cream/40 mt-2 led-text">
          TRY A DATE BETWEEN 1958 AND 2020
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* === TIME CAPSULE HEADER === */}
      <div className="relative">
        {/* VHS label style header */}
        <div className="bg-gradient-to-r from-crt-medium via-crt-dark to-crt-medium border border-crt-light/40 rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-vhs-red animate-pulse" />
              <span className="led-text text-vhs-red text-xs tracking-widest">PLAYBACK</span>
            </div>
            <span className="led-text text-phosphor-amber text-xs">{year}</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-aged-cream text-center">
            {dateDisplay}
          </h2>

          <p className="text-aged-cream/50 text-center mt-2 italic font-body">
            Here&apos;s what was happening...
          </p>

          {/* Tape counter decoration */}
          <div className="flex justify-center mt-4 gap-1">
            {String(year).split('').map((digit, i) => (
              <div
                key={i}
                className="led-display px-2 py-1 text-phosphor-teal text-lg"
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === CONTENT GRID === */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Music & Prices */}
        <div className="space-y-6">
          <SongList songs={results.songs} />
          {results.prices.length > 0 && (
            <>
              <PriceCard price={results.prices[0]} />
              <PriceComparison oldPrice={results.prices[0]} />
            </>
          )}
        </div>

        {/* Right Column - Movies & Events */}
        <div className="space-y-6">
          <MovieList movies={results.movies} />
          <EventList events={results.events} />
        </div>
      </div>

      {/* === SHARE CTA === */}
      <div className="bg-crt-dark border border-crt-light/30 rounded p-4 text-center">
        <p className="text-sm text-aged-cream/60 mb-3 font-body">
          Want to know what was #1 on someone else&apos;s birthday?
        </p>
        <button className="retro-btn px-6 py-2 text-phosphor-teal text-sm">
          SHARE THIS TIME CAPSULE
        </button>
      </div>
    </div>
  )
}
