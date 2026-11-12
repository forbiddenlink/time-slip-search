'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { SearchResults } from '@/lib/algolia'
import { FavoriteButton } from '@/components/memory/FavoriteButton'
import { extractShareData, copyShareLink, shareNative, generateTimeCapsuleSummary } from '@/lib/share'
import { createShareableURL } from '@/lib/url-state'
import { getFamousDate } from '@/lib/famous-dates'
import { generateEmotionalNarrative } from '@/lib/ai-insights'
import { FamousDateBanner } from './FamousDateBanner'
import { SongList } from './SongCard'
import { MovieList } from './MovieCard'
import { PriceCard, PriceComparison } from './PriceCard'
import { EventList } from './EventCard'

// Only the chart bundle is lazy; the text sections are static so a printed edition never renders blank.
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
  const famousDate = (month && day) ? getFamousDate(month, day, year) : null
  const emotionalNarrative = generateEmotionalNarrative(year, month, results)
  const topSong = results.songs[0]
  const topMovie = results.movies[0]
  const compareForwardYear = Math.min(year + 10, 2020)
  const compareBackwardYear = Math.max(year - 10, 1958)

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
      <div className="px-5 py-10 text-center md:px-10">
        <p className="ed-label text-edition">No edition on file</p>
        <h2 className="mt-3 font-display text-3xl italic text-balance md:text-4xl">{dateDisplay}</h2>
        <div className="mx-auto mt-4 h-[7px] max-w-md border-b border-t-[3px] border-ink" aria-hidden="true" />
        <p className="mt-4 font-body text-lg text-pretty">
          {isOutOfRange
            ? `${dateDisplay} is outside the archive.`
            : `Nothing is indexed for ${dateDisplay} yet.`}
        </p>
        <p className="mt-2 ed-label text-faded">
          {isOutOfRange ? 'Try a date between 1958 and 2020' : 'Try a nearby date or another year'}
        </p>
      </div>
    )
  }

  const hasSongs = results.songs.length > 0
  const hasPrices = results.prices.length > 0 && Boolean(results.prices[0])
  const hasMovies = results.movies.length > 0
  const hasEvents = results.events.length > 0
  const hasInsights = Boolean(insights && insights.length > 0)

  return (
    <div className="text-ink">
      {/* === MASTHEAD: the edition date === */}
      <header className="px-5 pt-5 md:px-10 md:pt-6">
        <div className="flex items-center justify-between ed-label text-faded">
          <span>Edition of {year}</span>
          <span>As printed on your date</span>
        </div>
        <h2 className="mt-3 text-center font-display text-[clamp(2.25rem,6vw,4.5rem)] italic leading-tight text-balance">
          {dateDisplay}
        </h2>
        <div className="mt-3 h-[7px] border-b border-t-[3px] border-ink" aria-hidden="true" />
        <p className="mx-auto mt-3 max-w-2xl text-center font-display text-lg italic text-balance md:text-xl">
          {emotionalNarrative}
        </p>
      </header>

      {/* === FAMOUS DATE === */}
      {famousDate && (
        <div className="px-5 pt-6 md:px-10">
          <FamousDateBanner famousDate={famousDate} />
        </div>
      )}

      {/* === FRONT PAGE: song lead, cost of living, movies, events === */}
      <div className="mt-6 border-t-[3px] border-ink">
        {(hasSongs || hasPrices) && (
          <div className="grid md:grid-cols-12">
            {hasSongs && (
              <div className={`px-5 py-6 md:px-10 md:py-8 ${hasPrices ? 'md:col-span-8 md:border-r md:border-ink' : 'md:col-span-12'}`}>
                <SongList songs={results.songs} chartWeek={results.chartWeek} />
              </div>
            )}
            {hasPrices && results.prices[0] && (
              <div className={`px-5 py-6 md:px-8 md:py-8 ${hasSongs ? 'border-t border-ink md:col-span-4 md:border-t-0' : 'md:col-span-12'}`}>
                <PriceCard price={results.prices[0]} />
                <PriceComparison oldPrice={results.prices[0]} />
              </div>
            )}
          </div>
        )}
        {(hasMovies || hasEvents) && (
          <div className={`grid border-t border-ink ${hasMovies && hasEvents ? 'md:grid-cols-2' : ''}`}>
            {hasMovies && (
              <div className={`px-5 py-6 md:px-10 ${hasEvents ? 'md:border-r md:border-ink' : ''}`}>
                <MovieList movies={results.movies} />
              </div>
            )}
            {hasEvents && (
              <div className={`px-5 py-6 md:px-10 ${hasMovies ? 'border-t border-ink md:border-t-0' : ''}`}>
                <EventList events={results.events} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* === EDITOR'S NOTES === */}
      {hasInsights && insights && (
        <section aria-labelledby="sec-notes" className="border-t border-ink px-5 py-6 md:px-10">
          <h3 id="sec-notes" className="ed-label border-b-2 border-ink pb-2">Editor&apos;s notes</h3>
          <ul className="mt-3 space-y-2 font-body text-base">
            {insights.map((insight, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true">&bull;</span>
                <span className="text-pretty">{insight.replace(/\p{Extended_Pictographic}\uFE0F?\s*/gu, '')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* === FURTHER READING: actions on this edition === */}
      <section aria-labelledby="sec-further" className="border-t-[3px] border-ink px-5 py-6 md:px-10">
        <h3 id="sec-further" className="ed-label text-faded">Further reading</h3>

        <div className="mt-4 flex flex-wrap gap-3">
          {onCompare && (
            <>
              <button
                type="button"
                onClick={() => onCompare(compareForwardYear)}
                disabled={compareForwardYear === year}
                className="ed-btn"
              >
                Compare {compareForwardYear}
              </button>
              <button
                type="button"
                onClick={() => onCompare(compareBackwardYear)}
                disabled={compareBackwardYear === year}
                className="ed-btn"
              >
                See {compareBackwardYear}
              </button>
            </>
          )}
          {onRandom && (
            <button type="button" onClick={onRandom} className="ed-btn">
              Random date
            </button>
          )}
          <FavoriteButton dateDisplay={dateDisplay} year={year} results={results} query={query} />
          <span className="relative inline-flex">
            <button type="button" onClick={handleShare} className="ed-btn">
              Share
            </button>
            {shareMessage && (
              <span
                role="status"
                className="absolute -top-11 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap bg-ink px-3 py-1.5 ed-label text-newsprint"
              >
                {shareMessage}
              </span>
            )}
          </span>
          <button type="button" onClick={handleCopyRecap} className="ed-btn">
            Copy recap
          </button>
          <button type="button" onClick={handleDownloadSnapshot} className="ed-btn">
            Download JSON
          </button>
          {topSong && (
            <a
              href={`https://open.spotify.com/search/${encodeURIComponent(`${topSong.song_title} ${topSong.artist}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-btn inline-flex items-center"
            >
              Find on Spotify
            </a>
          )}
        </div>

        {onCompare && (
          <div className="mt-6 flex flex-wrap items-end gap-4 border-t border-ink/25 pt-4">
            <div>
              <label htmlFor="compare-year" className="ed-label text-faded">Jump to a year</label>
              <input
                id="compare-year"
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
                placeholder="1958 to 2020"
                aria-label="Jump to a year to compare"
                className="mt-1 block w-44 border-0 border-b-2 border-ink bg-transparent py-1 font-display text-xl placeholder:text-ink/45 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              />
            </div>
            <button type="button" onClick={handleCompareJump} className="ed-btn">
              Jump to year
            </button>
          </div>
        )}

        {onExploreDecade && (
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="ed-label text-faded">Back issues</span>
            {decadePresets.map((decadeStart) => (
              <button
                key={decadeStart}
                type="button"
                onClick={() => onExploreDecade(decadeStart)}
                className="min-h-11 font-display text-lg underline-offset-4 hover:underline"
              >
                {decadeStart}s
              </button>
            ))}
          </div>
        )}

        {actionMessage && (
          <p role="status" className="mt-3 ed-label text-edition">
            {actionMessage}
          </p>
        )}
      </section>

      {/* === DATA INSIGHTS === */}
      <ChartInsights results={results} year={year} />
    </div>
  )
}
