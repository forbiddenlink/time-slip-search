'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { SearchResults } from '@/lib/algolia'
import { FavoriteButton } from '@/components/memory/FavoriteButton'
import { extractShareData, copyShareLink, shareNative, generateTimeCapsuleSummary } from '@/lib/share'
import { createShareableURL } from '@/lib/url-state'
import { getFamousDate } from '@/lib/famous-dates'
import { FamousDateBanner } from './FamousDateBanner'
import { Confetti } from '@/components/animations/Confetti'

// Dynamic imports - these components only render after API response (bundle-dynamic-imports)
const SongList = dynamic(() => import('./SongCard').then(m => ({ default: m.SongList })))
const MovieList = dynamic(() => import('./MovieCard').then(m => ({ default: m.MovieList })))
const PriceCard = dynamic(() => import('./PriceCard').then(m => ({ default: m.PriceCard })))
const PriceComparison = dynamic(() => import('./PriceCard').then(m => ({ default: m.PriceComparison })))
const EventList = dynamic(() => import('./EventCard').then(m => ({ default: m.EventList })))
const ChartInsights = dynamic(() => import('../visualizations/ChartInsights').then(m => ({ default: m.ChartInsights })))
const decadePresets = [1960, 1970, 1980, 1990, 2000, 2010, 2020] as const

interface TimeCapsuleProps {
  results: SearchResults
  dateDisplay: string
  year: number
  month?: number
  day?: number
  insights?: string[]
  onCompare?: (year: number) => void
  onRandom?: () => void
  onExploreDecade?: (decadeStart: number) => void
  query?: string
}

export function TimeCapsule({ results, dateDisplay, year, month, day, insights, onCompare, onRandom, onExploreDecade, query = '' }: TimeCapsuleProps) {
  const [shareMessage, setShareMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [compareYearInput, setCompareYearInput] = useState('')
  const [showConfetti, setShowConfetti] = useState(true)
  const famousDate = (month && day) ? getFamousDate(month, day, year) : null
  const topSong = results.songs[0]
  const topMovie = results.movies[0]
  const compareForwardYear = Math.min(year + 10, 2020)
  const compareBackwardYear = Math.max(year - 10, 1958)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const showTransientActionMessage = (message: string) => {
    setActionMessage(message)
    setTimeout(() => setActionMessage(''), 3000)
  }

  const hasData =
    results.songs.length > 0 ||
    results.movies.length > 0 ||
    results.prices.length > 0 ||
    results.events.length > 0

  const handleShare = async () => {
    const shareData = extractShareData(dateDisplay, year, results)
    const shareUrl = createShareableURL(query, { start: 0, end: 0, display: dateDisplay, year })

    // Try native share first
    const sharedNatively = await shareNative(shareData, shareUrl)

    if (!sharedNatively) {
      // Fallback to clipboard
      const copied = await copyShareLink(shareUrl)
      if (copied) {
        setShareMessage('\u2713 Link copied!')
        setTimeout(() => setShareMessage(''), 3000)
      } else {
        setShareMessage('\u2717 Failed to copy')
        setTimeout(() => setShareMessage(''), 3000)
      }
    }
  }

  const handleCopyRecap = async () => {
    const recap = generateTimeCapsuleSummary(dateDisplay, year, results)
    const copied = await copyShareLink(recap)
    showTransientActionMessage(copied ? '\u2713 Recap copied!' : '\u2717 Failed to copy recap')
  }

  const handleDownloadSnapshot = () => {
    if (typeof window === 'undefined') return

    const payload = {
      exportedAt: new Date().toISOString(),
      query,
      dateDisplay,
      year,
      highlights: {
        song: topSong ? `${topSong.song_title} - ${topSong.artist}` : null,
        movie: topMovie ? topMovie.title : null,
        gasPrice: results.prices[0]?.gas_price_gallon ?? null,
        event: results.events[0]?.title ?? null,
      },
      results,
    }

    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `timeslip-${year}-${dateDisplay.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      showTransientActionMessage('\u2713 Snapshot downloaded')
    } catch {
      showTransientActionMessage('\u2717 Failed to download snapshot')
    }
  }

  const handleCompareJump = () => {
    if (!onCompare) return

    const parsed = Number.parseInt(compareYearInput, 10)
    if (Number.isNaN(parsed) || parsed < 1958 || parsed > 2020) {
      showTransientActionMessage('Use a year between 1958 and 2020')
      return
    }

    setCompareYearInput('')
    onCompare(parsed)
  }

  if (!hasData) {
    const isOutOfRange = year < 1958 || year > 2020
    
    return (
      <div className="bg-crt-dark border border-crt-light/30 rounded p-6 text-center">
        <div className="led-text text-vhs-red text-sm tracking-widest mb-3">
          NO SIGNAL
        </div>
        <p className="text-aged-cream/80">
          {isOutOfRange 
            ? `${dateDisplay} is outside my coverage period.`
            : `I don&apos;t have data indexed for ${dateDisplay} yet.`
          }
        </p>
        <p className="text-sm text-aged-cream/60 mt-2 led-text">
          {isOutOfRange 
            ? 'TRY A DATE BETWEEN 1958 AND 2020'
            : 'DATABASE MAY NEED POPULATION - SEE SETUP.MD'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* === TIME CAPSULE HEADER === */}
      <div className="relative">
        {/* VHS label style header */}
        <div className="bg-gradient-to-r from-crt-medium via-crt-dark to-crt-medium border border-crt-light/40 rounded p-4 cascade-in">
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

        {/* CRT phosphor confetti celebration */}
        <Confetti isActive={showConfetti} variant="celebration" />
      </div>

      {/* === FAMOUS DATE EASTER EGG === */}
      {famousDate && <FamousDateBanner famousDate={famousDate} />}

      {/* === CONTENT GRID === */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Music & Prices */}
        <div className="space-y-6 section-reveal" style={{ animationDelay: '0.1s' }}>
          <SongList songs={results.songs} />
          {results.prices.length > 0 && results.prices[0] && (
            <>
              <PriceCard price={results.prices[0]} />
              <PriceComparison oldPrice={results.prices[0]} />
            </>
          )}
        </div>

        {/* Right Column - Movies & Events */}
        <div className="space-y-6 section-reveal" style={{ animationDelay: '0.3s' }}>
          <MovieList movies={results.movies} />
          <EventList events={results.events} />
        </div>
      </div>

      {/* === AI INSIGHTS === */}
      {insights && insights.length > 0 && (
        <div className="glass-card border border-phosphor-teal/30 rounded p-4 cascade-in stagger-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="led-text text-phosphor-teal text-xs tracking-widest">AI INSIGHTS</span>
          </div>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="text-aged-cream/90 text-sm flex items-start gap-2 animate-slide-in-right"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-phosphor-teal shrink-0">&bull;</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === QUICK ACTIONS === */}
      <div className="space-y-3">
        <div className="text-aged-cream/60 text-xs led-text tracking-widest">TRY THESE:</div>
        <div className="flex gap-2 flex-wrap">
          {onCompare && (
            <>
              <button
                onClick={() => onCompare(compareForwardYear)}
                disabled={compareForwardYear === year}
                className="px-4 py-2 bg-crt-dark border border-phosphor-teal/30
                         rounded hover:border-phosphor-teal hover:shadow-glow-teal
                         text-aged-cream text-sm transition-all hover-lift led-text
                         disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compare with {compareForwardYear}
              </button>
              <button
                onClick={() => onCompare(compareBackwardYear)}
                disabled={compareBackwardYear === year}
                className="px-4 py-2 bg-crt-dark border border-phosphor-amber/30
                         rounded hover:border-phosphor-amber hover:shadow-glow-amber
                         text-aged-cream text-sm transition-all hover-lift led-text
                         disabled:opacity-40 disabled:cursor-not-allowed"
              >
                See {compareBackwardYear}
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
              Random Date
            </button>
          )}

          {/* Favorite Button */}
          <FavoriteButton
            dateDisplay={dateDisplay}
            year={year}
            results={results}
            query={query}
          />

          {/* Enhanced Share Button */}
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-crt-dark border border-vinyl-label/50
                     rounded hover:border-vinyl-label hover:shadow-glow-amber
                     text-aged-cream text-sm transition-all hover-lift led-text relative"
          >
            Share
            {shareMessage && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                             bg-crt-dark border border-phosphor-teal px-2 py-1 rounded text-xs">
                {shareMessage}
              </span>
            )}
          </button>

          <button
            onClick={handleCopyRecap}
            className="px-4 py-2 bg-crt-dark border border-phosphor-teal/40
                     rounded hover:border-phosphor-teal hover:shadow-glow-teal
                     text-aged-cream text-sm transition-all hover-lift led-text"
          >
            Copy Recap
          </button>

          <button
            onClick={handleDownloadSnapshot}
            className="px-4 py-2 bg-crt-dark border border-phosphor-green/40
                     rounded hover:border-phosphor-green hover:shadow-glow-green
                     text-aged-cream text-sm transition-all hover-lift led-text"
          >
            Download JSON
          </button>

          {topSong && (
            <a
              href={`https://open.spotify.com/search/${encodeURIComponent(`${topSong.song_title} ${topSong.artist}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-crt-dark border border-phosphor-amber/40
                       rounded hover:border-phosphor-amber hover:shadow-glow-amber
                       text-aged-cream text-sm transition-all hover-lift led-text"
            >
              Open in Spotify
            </a>
          )}

          {topMovie && (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${topMovie.title} ${topMovie.year} trailer`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-crt-dark border border-vinyl-label/40
                       rounded hover:border-vinyl-label hover:shadow-glow-teal
                       text-aged-cream text-sm transition-all hover-lift led-text"
            >
              Find Trailer
            </a>
          )}
        </div>

        {onCompare && (
          <div className="flex gap-2 flex-wrap items-center">
            <input
              type="number"
              min={1958}
              max={2020}
              value={compareYearInput}
              onChange={(e) => setCompareYearInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCompareJump()
                }
              }}
              placeholder="Jump to year (1958-2020)"
              aria-label="Jump to a year to compare"
              className="bg-crt-black border border-crt-light/40 rounded px-3 py-2 text-sm text-aged-cream placeholder-aged-cream/40 w-56"
            />
            <button
              onClick={handleCompareJump}
              className="px-4 py-2 bg-crt-dark border border-phosphor-amber/40
                       rounded hover:border-phosphor-amber hover:shadow-glow-amber
                       text-aged-cream text-sm transition-all hover-lift led-text"
            >
              Compare Year
            </button>
          </div>
        )}

        {onExploreDecade && (
          <div className="flex gap-2 flex-wrap">
            {decadePresets.map((decadeStart) => (
              <button
                key={decadeStart}
                onClick={() => onExploreDecade(decadeStart)}
                className="px-3 py-2 bg-crt-dark border border-crt-light/40 rounded
                         hover:border-phosphor-green hover:shadow-glow-green
                         text-aged-cream text-xs transition-all led-text tracking-wider"
              >
                {decadeStart}s
              </button>
            ))}
          </div>
        )}

        {actionMessage && (
          <p className="text-xs text-phosphor-teal led-text tracking-wider">
            {actionMessage}
          </p>
        )}
      </div>

      {/* Data Visualizations */}
      <div className="cascade-in stagger-6">
        <ChartInsights results={results} year={year} />
      </div>
    </div>
  )
}
