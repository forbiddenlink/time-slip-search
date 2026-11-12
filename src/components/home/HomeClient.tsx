'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import type { SearchResults } from '@/lib/algolia'
import { TimeCapsule } from '@/components/results/TimeCapsule'
import { MessageSkeleton } from '@/components/chat/LoadingSkeleton'
import { AgentMemoryPanel } from '@/components/memory/AgentMemoryPanel'
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete'
import { QuickActionChips } from '@/components/search/QuickActionChips'
import { EditionIndex } from '@/components/home/EditionIndex'
import { SpecimenPage } from '@/components/home/SpecimenPage'
import { SiteHeader, SiteFooter } from '@/components/layout/SiteChrome'
import { VoiceInput } from '@/components/input/VoiceInput'
import { SearchHistory } from '@/lib/agent-memory'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { encodeSearchToURL, decodeURLToSearch } from '@/lib/url-state'
import { ComparisonPanel } from '@/components/results/ComparisonPanel'
import { VHSEffect, VHSRewindEffect } from '@/components/animations/VHSEffect'
import { ParticleEffect, ParticleBurst } from '@/components/animations/ParticleEffect'
import { trackSearch, getWrappedStats, type WrappedStats } from '@/lib/wrapped'
import { checkAchievements, updateStreak, type Achievement } from '@/lib/achievements'

const Timeline = dynamic(() => import('@/components/Timeline').then((m) => m.Timeline), { ssr: false })
const WrappedExperience = dynamic(() => import('@/components/wrapped/WrappedExperience').then((m) => m.WrappedExperience), { ssr: false })
const AchievementsPanel = dynamic(() => import('@/components/achievements/AchievementsPanel').then((m) => m.AchievementsPanel), { ssr: false })
const AchievementToast = dynamic(() => import('@/components/achievements/AchievementToast').then((m) => m.AchievementToast), { ssr: false })
const KeyboardShortcutsModal = dynamic(() => import('@/components/KeyboardShortcutsModal').then((m) => m.KeyboardShortcutsModal), { ssr: false })

interface StructuredResult {
  dateDisplay: string
  year: number
  month?: number
  day?: number
  results: SearchResults
  suggestions?: string[]
  insights?: string[]
  comparisonResult?: StructuredResult
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  structured?: StructuredResult
}

// Hoisted outside component to prevent recreation on each render (rerender-memo-with-default-value)
// Copy optimized for emotional connection and specificity
const exampleQueries = [
  { text: "What was #1 the day I was born?", query: "March 15, 1987" },
  { text: "Take me back to the Summer of '69", query: "Summer of 69" },
  { text: "How much did a gallon of gas cost?", query: "December 1985" },
  { text: "The night the Berlin Wall fell", query: "November 9, 1989" },
] as const

const decadeQuickPicks = [1960, 1970, 1980, 1990, 2000, 2010, 2020] as const

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  // New state for viral features
  const [showWrapped, setShowWrapped] = useState(false)
  const [wrappedStats, setWrappedStats] = useState<WrappedStats | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [showVHSEffect, setShowVHSEffect] = useState(false)
  const [showParticles, setShowParticles] = useState(true)
  const [showRewind, setShowRewind] = useState(false)
  const [showRandomBurst, setShowRandomBurst] = useState(false)
  const [sessionYears, setSessionYears] = useState<number[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')
  const [comparisonState, setComparisonState] = useState<{
    base: StructuredResult
    compare: StructuredResult
  } | null>(null)

  // Update streak on mount
  useEffect(() => {
    updateStreak()
  }, [])

  // Load search from URL on mount
  useEffect(() => {
    const urlData = decodeURLToSearch(searchParams)
    if (urlData.query && !isLoading) {
      setQuery(urlData.query)
      // Auto-execute search from URL
      setTimeout(() => {
        const form = document.querySelector('form')
        if (form) form.requestSubmit()
      }, 100)
    }
  }, []) // Run once on mount

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
      }
      // Esc to clear input or close modals
      if (e.key === 'Escape') {
        if (showWrapped) {
          setShowWrapped(false)
        } else if (showAchievements) {
          setShowAchievements(false)
        } else if (!isLoading) {
          setQuery('')
          setShowAutocomplete(false)
        }
      }
      // Ctrl/Cmd + T for timeline
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        setShowTimeline(prev => !prev)
      }
      // Ctrl/Cmd + W for Wrapped/Time Capsule
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault()
        setWrappedStats(getWrappedStats())
        setShowWrapped(true)
      }
      // Ctrl/Cmd + B for Badges/Achievements
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setShowAchievements(true)
      }
      // Ctrl/Cmd + E for VHS Effect
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        setShowVHSEffect(prev => !prev)
      }
      // Ctrl/Cmd + P for Particles
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowParticles(prev => !prev)
      }
      // Ctrl/Cmd + / for help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcuts(true)
      }
    }
    globalThis.addEventListener('keydown', handleKeyDown)
    return () => globalThis.removeEventListener('keydown', handleKeyDown)
  }, [isLoading, showWrapped, showAchievements])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setShowAutocomplete(value.length > 0)
  }, [])

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion)
    setShowAutocomplete(false)
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 100)
  }, [])

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setQuery(transcript)
    setShowAutocomplete(false)
    // Auto-submit voice queries
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 300)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (!query.trim()) {
      document.getElementById('date-input')?.focus()
      return
    }

    setComparisonState(null)
    setShowAutocomplete(false)
    const userMessage = query.trim()
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document.getElementById('results')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()

      // Track search in wrapped stats and check achievements
      if (data.structured) {
        const year = data.structured.year
        setSessionYears(prev => [...prev, year])

        // Track in wrapped system
        trackSearch(userMessage, year, data.structured.results)

        // Get all years explored for achievement checking
        const wrappedData = getWrappedStats()

        // Check for new achievements
        const newAchievements = checkAchievements({
          yearsExplored: wrappedData.yearsExplored,
          totalSongs: wrappedData.discoveries.totalSongs,
          totalMovies: wrappedData.discoveries.totalMovies,
          totalPrices: wrappedData.discoveries.totalPrices,
          currentYear: year,
          sessionYears: sessionYears,
        })

        // Show achievement toast if any unlocked
        if (newAchievements.length > 0) {
          setCurrentAchievement(newAchievements[0] ?? null)
        }

        // Track search in agent memory
        SearchHistory.add({
          query: userMessage,
          dateDisplay: data.structured.dateDisplay,
          year: data.structured.year,
          resultCount: (
            data.structured.results.songs.length +
            data.structured.results.movies.length +
            data.structured.results.prices.length +
            data.structured.results.events.length
          ),
        })
      }

      // Track search in agent memory
      if (data.structured) {
        const urlParams = encodeSearchToURL(userMessage, {
          start: 0,
          end: 0,
          display: data.structured.dateDisplay,
          year: data.structured.year,
        })
        router.push(`/${urlParams}`, { scroll: false })
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        structured: data.structured,
      }])

      if (data.structured?.dateDisplay) {
        setLiveAnnouncement(`Loaded results for ${data.structured.dateDisplay}`)
      }

      // Handle auto-comparison from natural language query
      if (data.structured?.comparisonResult) {
        setComparisonState({
          base: data.structured,
          compare: data.structured.comparisonResult,
        })
        setLiveAnnouncement(`Comparing ${data.structured.year} vs ${data.structured.comparisonResult.year}`)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.'
      }])
      setLiveAnnouncement('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitQuery = useCallback((value: string) => {
    setQuery(value)
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 100)
  }, [])

  const handleMemorySelect = useCallback((query: string) => {
    setQuery(query)
    // Auto-submit
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 100)
  }, [])

  const handleCompare = async (targetYear: number, baseData?: StructuredResult) => {
    const fallbackBase =
      baseData ??
      [...messages]
        .reverse()
        .find((m) => m.structured)?.structured

    if (!fallbackBase) {
      setLiveAnnouncement('No base result available for comparison yet.')
      return
    }

    if (targetYear === fallbackBase.year) {
      setLiveAnnouncement('Pick a different year to compare.')
      return
    }

    const comparisonQuery = `Year ${targetYear}`
    setComparisonState(null)
    setMessages(prev => [...prev, {
      role: 'user',
      content: `🔁 Compare ${fallbackBase.year} vs ${targetYear}`,
    }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: comparisonQuery }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        structured: data.structured,
      }])
      if (data.structured) {
        setComparisonState({
          base: fallbackBase,
          compare: data.structured,
        })
        setLiveAnnouncement(`Compared ${fallbackBase.year} with ${data.structured.year}`)
      }
    } catch (error) {
      console.error('Comparison error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that comparison.'
      }])
      setLiveAnnouncement('Comparison failed. Please try another year.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRandom = async (range?: { startYear: number; endYear: number; label: string }) => {
    // Trigger particle burst effect
    setShowRandomBurst(true)
    setComparisonState(null)
    const minYear = range ? range.startYear : 1958
    const maxYear = range ? range.endYear : 2020
    const randomYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear
    const randomMonth = Math.floor(Math.random() * 12) + 1
    const randomDay = Math.floor(Math.random() * 28) + 1 // Keep it simple, avoid edge cases
    const randomDate = `${randomMonth}/${randomDay}/${randomYear}`

    setMessages(prev => [...prev, { role: 'user', content: range ? `${range.label}: ${randomDate}` : `🎲 Random: ${randomDate}` }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: randomDate }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        structured: data.structured,
      }])
      if (data.structured?.dateDisplay) {
        setLiveAnnouncement(`Loaded random result for ${data.structured.dateDisplay}`)
      }
    } catch (error) {
      console.error('Random date error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble with that random date.'
      }])
      setLiveAnnouncement('Random search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExploreDecade = (decadeStart: number) => {
    const decadeEnd = Math.min(decadeStart + 9, 2020)
    void handleRandom({
      startYear: decadeStart,
      endYear: decadeEnd,
      label: `🎛️ ${decadeStart}s jump`,
    })
  }

  const hasResults = messages.length > 0

  return (
    <div className="min-h-screen bg-ink text-newsprint">
      <a
        href="#date-search"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-newsprint text-ink px-3 py-2 ed-label"
      >
        Skip to date search
      </a>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pt-8 md:pt-12">
        {/* === HERO: the front page. The dateline is the search field. === */}
        <div className={`ed-sheet ${isLoading ? 'ed-printing' : ''}`}>
          <div className="px-5 pt-5 md:px-10 md:pt-6">
            <div className="flex items-center justify-between ed-label text-faded">
              <span>Editions 1958 to 2020</span>
              <span>Search any date</span>
            </div>
            <h1 className="mt-3 text-center font-nameplate text-[clamp(3rem,10vw,7rem)] leading-none">
              TimeSlip Search
            </h1>
            <div className="mt-3 h-[7px] border-b border-t-[3px] border-ink" aria-hidden="true" />
            <p className="mt-3 text-center font-display text-lg italic text-balance md:text-xl">
              The #1 song, the movies, the prices and the headlines from any day you pick.
            </p>
          </div>

          <form id="date-search" onSubmit={handleSubmit} className="px-5 pb-6 pt-6 md:px-10 md:pb-8">
            <label htmlFor="date-input" className="ed-label text-faded">Edition for</label>
            <div className="mt-1 flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative flex-1">
                <input
                  id="date-input"
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => query.length > 0 && setShowAutocomplete(true)}
                  placeholder="March 15, 1987"
                  autoComplete="off"
                  aria-label="Enter a date to search, like your birthday or a year"
                  className="ed-focus w-full bg-transparent py-1 font-display text-[clamp(2.25rem,7vw,5.5rem)] italic leading-tight text-ink placeholder:text-faded focus:outline-none disabled:opacity-60"
                  disabled={isLoading}
                />
                <div className="ed-roller" aria-hidden="true" />
                <SearchAutocomplete
                  query={query}
                  onSelect={handleSuggestionSelect}
                  isVisible={showAutocomplete}
                  onClose={() => setShowAutocomplete(false)}
                />
              </div>
              <div className="flex items-center gap-3">
                <VoiceInput onTranscript={handleVoiceTranscript} isDisabled={isLoading} />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ed-label min-h-12 flex-1 bg-edition px-6 py-3 text-[#fff8ea] text-sm hover:bg-[#9e1f18] disabled:cursor-not-allowed disabled:bg-faded md:flex-none md:px-8"
                >
                  {isLoading ? 'Printing' : 'Go to press'}
                </button>
              </div>
            </div>
            <p className="mt-3 font-display text-base text-faded">
              Try a birthday, a year, or a phrase like &quot;Summer of 69&quot;.
            </p>
          </form>

          {!hasResults && <SpecimenPage />}
        </div>

        {/* Tools */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 ed-label text-newsprint">
          <button
            type="button"
            className="min-h-11 hover:underline underline-offset-4"
            onClick={() => {
              setWrappedStats(getWrappedStats())
              setShowWrapped(true)
            }}
          >
            Wrapped
          </button>
          <button type="button" className="min-h-11 hover:underline underline-offset-4" onClick={() => setShowAchievements(true)}>
            Badges
          </button>
          <button
            type="button"
            aria-pressed={showVHSEffect}
            className={`min-h-11 hover:underline underline-offset-4 ${showVHSEffect ? 'underline' : ''}`}
            onClick={() => setShowVHSEffect(!showVHSEffect)}
          >
            VHS filter {showVHSEffect ? 'on' : 'off'}
          </button>
          <button
            type="button"
            aria-pressed={showParticles}
            className={`min-h-11 hover:underline underline-offset-4 ${showParticles ? 'underline' : ''}`}
            onClick={() => setShowParticles(!showParticles)}
          >
            Era particles {showParticles ? 'on' : 'off'}
          </button>
          <button type="button" className="min-h-11 hover:underline underline-offset-4" onClick={() => setShowTimeline((prev) => !prev)}>
            Timeline
          </button>
          <button type="button" className="min-h-11 hover:underline underline-offset-4" onClick={() => setShowShortcuts(true)}>
            Shortcuts
          </button>
        </div>

        {showTimeline && (
          <div className="mt-8 animate-fade-in">
            <ErrorBoundary>
              <Timeline
                currentYear={messages.length > 0 && messages[messages.length - 1]?.structured?.year
                  ? messages[messages.length - 1]!.structured!.year
                  : new Date().getFullYear()}
                onYearSelect={(year) => {
                  setQuery(`January ${year}`)
                  setTimeout(() => {
                    const form = document.querySelector('form')
                    if (form) form.requestSubmit()
                  }, 100)
                }}
              />
            </ErrorBoundary>
          </div>
        )}

        {comparisonState && (
          <div className="mt-8">
            <ComparisonPanel
              base={comparisonState.base}
              compare={comparisonState.compare}
              onClose={() => setComparisonState(null)}
              onSwap={() =>
                setComparisonState((current) =>
                  current
                    ? { base: current.compare, compare: current.base }
                    : current
                )
              }
            />
          </div>
        )}

        {!hasResults && (
          <div className="mt-12 space-y-12">
            <EditionIndex examples={exampleQueries} onSelect={submitQuery} />

            {/* Back issues */}
            <section aria-labelledby="back-issues">
              <h2 id="back-issues" className="ed-label border-b-2 border-newsprint pb-2">Back issues</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1">
                {decadeQuickPicks.map((decade) => (
                  <button
                    key={decade}
                    type="button"
                    onClick={() => handleExploreDecade(decade)}
                    className="min-h-11 font-display text-xl hover:underline underline-offset-4"
                  >
                    {decade}s
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void handleRandom()}
                  className="min-h-11 ed-label border border-newsprint px-4 hover:bg-newsprint hover:text-ink"
                >
                  Random date
                </button>
              </div>
              <div className="mt-4">
                <QuickActionChips visible={true} onSelect={submitQuery} />
              </div>
            </section>

            <AgentMemoryPanel onSelectSearch={handleMemorySelect} />

            <section aria-labelledby="coverage" className="max-w-3xl">
              <h2 id="coverage" className="ed-label border-b-2 border-newsprint pb-2">About the archive</h2>
              <p className="mt-3 font-body text-lg text-pretty">
                Editions run from 1958 to 2020. Songs come from the weekly Billboard Hot 100, movies from The Movie
                Database, events from the Wikimedia On This Day feed and prices from FRED. The{' '}
                <Link href="/about" className="underline underline-offset-4 hover:text-white">about page</Link>{' '}
                explains how each is matched to your date.
              </p>
            </section>
          </div>
        )}

        {/* === PRESSROOM: results === */}
        {hasResults && (
          <section id="results" aria-label="Results" className="mt-10 scroll-mt-4">
            <VHSEffect isActive={showVHSEffect} intensity="low">
              <ParticleEffect isActive={showParticles && hasResults} />
              <div className="relative z-20 space-y-8">
                {messages.map((message, index) => (
                  <div key={index}>
                    {message.role === 'user' ? (
                      <p className="ed-label border-b border-newsprint/40 pb-2 text-muted">
                        Edition requested: <span className="text-newsprint">{message.content}</span>
                      </p>
                    ) : (
                      <div className="ed-out">
                        {message.structured ? (
                          <ErrorBoundary>
                            <TimeCapsule
                              results={message.structured.results}
                              dateDisplay={message.structured.dateDisplay}
                              year={message.structured.year}
                              month={message.structured.month}
                              day={message.structured.day}
                              insights={message.structured.insights}
                              onCompare={(targetYear) => {
                                void handleCompare(targetYear, message.structured)
                              }}
                              onRandom={() => void handleRandom()}
                              onExploreDecade={handleExploreDecade}
                              query={message.content}
                            />
                          </ErrorBoundary>
                        ) : (
                          <div className="border border-newsprint/30 bg-crt-dark px-4 py-3">
                            <p className="ed-label text-muted">Notice</p>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && <MessageSkeleton />}
              </div>
            </VHSEffect>
          </section>
        )}
      </main>

      <SiteFooter />

      {/* Modals and Overlays */}
      {showWrapped && wrappedStats && (
        <WrappedExperience stats={wrappedStats} onClose={() => setShowWrapped(false)} />
      )}

      {showAchievements && (
        <AchievementsPanel isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      )}

      {currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onDismiss={() => setCurrentAchievement(null)}
        />
      )}

      {showRewind && (
        <VHSRewindEffect onComplete={() => setShowRewind(false)} />
      )}

      {showRandomBurst && (
        <ParticleBurst
          isActive={showRandomBurst}
          onComplete={() => setShowRandomBurst(false)}
        />
      )}

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

export default function HomeClient() {
  return <HomeContent />
}
