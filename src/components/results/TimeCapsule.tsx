'use client'

import dynamic from 'next/dynamic'
import { SearchResults } from '@/lib/algolia'
import { FavoriteButton } from '@/components/memory/FavoriteButton'

// Dynamic imports - these components only render after API response (bundle-dynamic-imports)
const SongList = dynamic(() => import('./SongCard').then(m => ({ default: m.SongList })))
const MovieList = dynamic(() => import('./MovieCard').then(m => ({ default: m.MovieList })))
const PriceCard = dynamic(() => import('./PriceCard').then(m => ({ default: m.PriceCard })))
const PriceComparison = dynamic(() => import('./PriceCard').then(m => ({ default: m.PriceComparison })))
const EventList = dynamic(() => import('./EventCard').then(m => ({ default: m.EventList })))
const ChartInsights = dynamic(() => import('../visualizations/ChartInsights').then(m => ({ default: m.ChartInsights })))

interface TimeCapsuleProps {
  results: SearchResults
  dateDisplay: string
  year: number
  insights?: string[]
  onCompare?: (year: number) => void
  onRandom?: () => void
  query?: string
}

export function TimeCapsule({ results, dateDisplay, year, insights, onCompare, onRandom, query = '' }: TimeCapsuleProps) {
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

      {/* === AI INSIGHTS === */}
      {insights && insights.length > 0 && (
        <div className="glass-card border border-phosphor-teal/30 rounded p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="led-text text-phosphor-teal text-xs tracking-widest">💡 AI INSIGHTS</span>
          </div>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="text-aged-cream/90 text-sm flex items-start gap-2 animate-slide-in-right"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-phosphor-teal shrink-0">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === QUICK ACTIONS === */}
      <div className="space-y-3">
        <div className="text-aged-cream/60 text-xs led-text tracking-widest">💡 TRY THESE:</div>
        <div className="flex gap-2 flex-wrap">
          {year < 2020 && onCompare && (
            <>
              <button
                onClick={() => onCompare(year + 10)}
                className="px-4 py-2 bg-crt-dark border border-phosphor-teal/30 
                         rounded hover:border-phosphor-teal hover:shadow-glow-teal
                         text-aged-cream text-sm transition-all hover-lift led-text"
              >
                🔄 Compare with {year + 10}
              </button>
              <button
                onClick={() => onCompare(year - 10)}
                className="px-4 py-2 bg-crt-dark border border-phosphor-amber/30 
                         rounded hover:border-phosphor-amber hover:shadow-glow-amber
                         text-aged-cream text-sm transition-all hover-lift led-text"
              >
                ⏮️ See {year - 10}
              </button>
            </>
          )}
          
          {onRandom && (
            <button
              onClick={onRandom}
              className="px-4 py-2 bg-crt-dark border border-phosphor-green/30 
                       rounded hover:border-phosphor-green hover:shadow-glow-green
                       text-aged-cream text-sm transition-all hover-lift led-text"
            >
              🎲 Random Date
            </button>
          )}

          {/* Favorite Button */}
          <FavoriteButton
            dateDisplay={dateDisplay}
            year={year}
            results={results}
            query={query}
          />

          {results.songs.length > 0 && (
            <button
              onClick={() => {
                const topSong = results.songs[0]
                const text = `🎵 On ${dateDisplay}, the #1 song was "${topSong.song_title}" by ${topSong.artist}! What was #1 on YOUR birthday? Find out at TimeSlipSearch.com`
                if (navigator.share) {
                  navigator.share({ text })
                } else {
                  navigator.clipboard.writeText(text)
                  alert('Copied to clipboard! 📋')
                }
              }}
              className="px-4 py-2 bg-crt-dark border border-vinyl-label/50 
                       rounded hover:border-vinyl-label hover:shadow-glow-amber
                       text-aged-cream text-sm transition-all hover-lift led-text"
            >
              📸 Share
            </button>
          )}
        </div>
      </div>

      {/* Data Visualizations */}
      <ChartInsights results={results} year={year} />
    </div>
  )
}
