'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import type { SearchResults } from '@/lib/algolia'
import { TimeCapsule } from '@/components/results/TimeCapsule'
import { MessageSkeleton } from '@/components/chat/LoadingSkeleton'
import { AgentMemoryPanel } from '@/components/memory/AgentMemoryPanel'
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete'
import { VoiceInput } from '@/components/input/VoiceInput'
import { SearchHistory } from '@/lib/agent-memory'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { encodeSearchToURL, decodeURLToSearch } from '@/lib/url-state'
import { ComparisonPanel } from '@/components/results/ComparisonPanel'
import { VHSEffect, VHSRewindEffect } from '@/components/animations/VHSEffect'
import { ParticleEffect } from '@/components/animations/ParticleEffect'
import { trackSearch, getWrappedStats, type WrappedStats } from '@/lib/wrapped'
import { checkAchievements, updateStreak, type Achievement } from '@/lib/achievements'
import { GiftIcon, TrophyIcon, FilmIcon, SparklesIcon, MusicIcon, DollarIcon, CalendarIcon } from '@/components/icons/Icons'

const Timeline = dynamic(() => import('@/components/Timeline').then((m) => m.Timeline), { ssr: false })
const WrappedCard = dynamic(() => import('@/components/wrapped/WrappedCard').then((m) => m.WrappedCard), { ssr: false })
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

// Feature cards with professional components
const featureCardsData = [
  { IconComponent: MusicIcon, label: '#1 Songs', period: '350K+ charts', iconColor: '#ffd633' },
  { IconComponent: FilmIcon, label: 'Movies', period: '50K+ films', iconColor: '#5ffff0' },
  { IconComponent: DollarIcon, label: 'Prices', period: 'Real costs', iconColor: '#4dff28' },
  { IconComponent: CalendarIcon, label: 'Events', period: '20K+ moments', iconColor: '#40e0d0' },
] as const

const decadeQuickPicks = [1960, 1970, 1980, 1990, 2000, 2010, 2020] as const

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState('--:--')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  
  // New state for viral features
  const [showWrapped, setShowWrapped] = useState(false)
  const [wrappedStats, setWrappedStats] = useState<WrappedStats | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [showVHSEffect, setShowVHSEffect] = useState(false)
  const [showParticles, setShowParticles] = useState(true)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [showRewind, setShowRewind] = useState(false)
  const [sessionYears, setSessionYears] = useState<number[]>([])
  const [isBooted, setIsBooted] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')
  const [comparisonState, setComparisonState] = useState<{
    base: StructuredResult
    compare: StructuredResult
  } | null>(null)

  // CRT boot-up sequence
  useEffect(() => {
    const timer = setTimeout(() => setIsBooted(true), 1400)
    return () => clearTimeout(timer)
  }, [])

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

  // Update clock client-side only to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

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

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setShowAutocomplete(value.length > 0)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    setShowAutocomplete(false)
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 100)
  }

  const handleVoiceTranscript = (transcript: string) => {
    setQuery(transcript)
    setShowAutocomplete(false)
    // Auto-submit voice queries
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setComparisonState(null)
    setShowAutocomplete(false)
    const userMessage = query.trim()
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

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
        setCurrentYear(year)
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

  const handleExampleClick = (example: string) => {
    setQuery(example)
  }

  const handleMemorySelect = (query: string) => {
    setQuery(query)
    // Auto-submit
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 100)
  }

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

  return (
    <div className={`min-h-screen bg-crt-black ${!isBooted ? 'crt-boot' : ''}`}>
      <a
        href="#main-console"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100]
                 bg-crt-dark border border-phosphor-teal rounded px-3 py-2 text-phosphor-teal led-text"
      >
        Skip to search console
      </a>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>
      {!isBooted && <div className="boot-flash" aria-hidden="true" />}
      {/* VHS tracking line effect */}
      <div className="vhs-tracking fixed inset-0 pointer-events-none z-50" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* === HEADER: VCR Console Style === */}
        <header className="mb-12">
          {/* Top control strip */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-vhs-red animate-pulse" />
              <span className="led-text text-vhs-red text-sm tracking-widest">REC</span>
            </div>
            <div className="led-display">
              <span className="text-phosphor-amber text-lg tracking-wider">
                {currentTime}
              </span>
            </div>
          </div>

          {/* Main title */}
          <div className="text-center space-y-5">
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight leading-none">
              <span className="title-glow-teal phosphor-breathe inline-block">Time</span>
              <span className="title-glow-amber inline-block ml-1">Slip</span>
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-phosphor-teal/40 to-transparent" />
              <p className="led-text text-phosphor-amber text-2xl tracking-[0.4em] uppercase">
                Search
              </p>
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent via-phosphor-teal/40 to-transparent" />
            </div>
            <p className="text-aged-cream/70 text-lg italic font-body max-w-md mx-auto">
              Your cultural time machine — see the #1 song, the movies, the prices, and the headlines from any date
            </p>
          </div>
        </header>

        {comparisonState && (
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
        )}

        {/* === AGENT MEMORY: Recent Searches & Favorites === */}
        {messages.length === 0 && (
          <AgentMemoryPanel onSelectSearch={handleMemorySelect} />
        )}

        {/* === TIMELINE EXPLORER === */}
        {showTimeline && (
          <div className="mb-10 animate-fade-in">
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

        {/* === FEATURE CARDS: Cassette Tape Style === */}
        {messages.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {featureCardsData.map((feature, index) => {
              const IconComponent = feature.IconComponent
              return (
                <div
                  key={feature.label}
                  className={`feature-card-enhanced p-5 group cursor-pointer cascade-in stagger-${index + 1}`}
                >
                  <div className="relative z-10 pt-14 text-center">
                    <div className="mb-4 flex justify-center glow-text-subtle" style={{ color: feature.iconColor }}>
                      <IconComponent size={36} />
                    </div>
                    <div className="text-base font-medium text-aged-cream tracking-wide">
                      {feature.label}
                    </div>
                    <div className="text-xs text-aged-cream/60 mt-2 led-text tracking-wider">
                      {feature.period}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        {/* === MAIN CONSOLE: CRT Screen === */}
        <div id="main-console" tabIndex={-1} className="crt-screen-enhanced screen-depth border-4 border-crt-medium relative phosphor-grid">
          {/* VHS Effect Overlay */}
          <VHSEffect isActive={showVHSEffect} intensity="low">
            {/* Particle Effect */}
            <ParticleEffect year={currentYear} isActive={showParticles && messages.length > 0} />
            
            {/* Screen bezel top */}
            <div className="bg-crt-dark px-6 py-3 border-b border-crt-light/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="led-text text-phosphor-teal text-sm">CH</span>
                <span className="led-text text-phosphor-amber">03</span>
              </div>
              <div className="text-aged-cream/60 text-xs tracking-widest led-text">
                TIMESLIP SEARCH v1.0
              </div>
              <div className="flex gap-2">
                {/* Time Capsule Button */}
                <button
                  onClick={() => {
                    setWrappedStats(getWrappedStats())
                    setShowWrapped(true)
                  }}
                  className="px-3 py-2 bg-crt-dark border border-phosphor-teal/40 text-phosphor-teal rounded text-xs led-text tracking-wider hover:border-phosphor-teal hover:shadow-glow-teal hover:scale-105 transition-all flex items-center gap-1.5"
                  title="View Your Time Capsule"
                  aria-label="Wrapped"
                >
                  <GiftIcon size={16} />
                  <span>Wrapped</span>
                </button>
                
                {/* Achievements Button */}
                <button
                  onClick={() => setShowAchievements(true)}
                  className="px-3 py-2 bg-crt-dark border border-phosphor-amber/40 text-phosphor-amber rounded text-xs led-text tracking-wider hover:border-phosphor-amber hover:shadow-glow-amber hover:scale-105 transition-all flex items-center gap-1.5"
                  title="View Achievements"
                  aria-label="Badges"
                >
                  <TrophyIcon size={16} />
                  <span>Badges</span>
                </button>
                
                {/* VHS Effect Toggle */}
                <button
                  onClick={() => setShowVHSEffect(!showVHSEffect)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1.5 ${
                    showVHSEffect
                      ? 'bg-vhs-red text-aged-cream shadow-lg'
                      : 'bg-crt-light/30 text-aged-cream hover:bg-crt-light/40'
                  }`}
                  title="Toggle VHS Effect"
                  aria-label="Toggle VHS Effect"
                >
                  <FilmIcon size={16} />
                  <span className="hidden sm:inline">VHS</span>
                </button>
                
                {/* Particles Toggle */}
                <button
                  onClick={() => setShowParticles(!showParticles)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1.5 ${
                    showParticles
                      ? 'bg-crt-dark border border-phosphor-teal text-phosphor-teal shadow-glow-teal'
                      : 'bg-crt-light/30 text-aged-cream hover:bg-crt-light/40'
                  }`}
                  title="Toggle Era Particles"
                  aria-label="Toggle Era Particles"
                >
                  <SparklesIcon size={16} />
                </button>
              </div>
            </div>

          {/* Messages Area */}
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-6 retro-scroll relative z-20">
            {messages.length === 0 ? (
              <div className="text-center">
                <p className="text-aged-cream/80 mb-2 text-xl font-body italic">
                  What was the world like the day you were born?
                </p>
                <p className="text-aged-cream/50 mb-8 text-sm font-body">
                  Type any date, year, or era from 1958 to 2020
                </p>

                {/* Example queries as tape labels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example.query)}
                      className={`example-card group text-left p-5 bg-crt-dark border border-crt-light/30 rounded hover:border-phosphor-teal/50 transition-all duration-300 hover:shadow-glow-teal cascade-in stagger-${index + 3}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="led-text text-phosphor-amber text-lg shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-aged-cream group-hover:text-phosphor-teal transition-colors text-base">
                            {example.text}
                          </span>
                          <span className="text-aged-cream/60 text-xs mt-1.5 led-text tracking-wider">
                            {example.query}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <p className="mt-8 text-sm text-aged-cream/60 led-text tracking-wide cascade-in stagger-7">
                  ALSO TRY: &quot;THE 80S&quot; &bull; &quot;CHRISTMAS 1992&quot; &bull; &quot;MY 21ST BIRTHDAY&quot;
                </p>

                {/* Random Date Quick Action */}
                <div className="mt-6 cascade-in stagger-8">
                  <button
                    onClick={() => void handleRandom()}
                    className="px-6 py-3 bg-crt-dark border border-phosphor-green/30 
                             rounded hover:border-phosphor-green hover:shadow-glow-green
                             text-aged-cream transition-all hover-lift led-text"
                  >
                    🎲 SURPRISE ME WITH A RANDOM DATE
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {decadeQuickPicks.map((decade) => (
                    <button
                      key={decade}
                      onClick={() => handleExploreDecade(decade)}
                      className="px-3 py-2 bg-crt-dark border border-crt-light/40 rounded
                               hover:border-phosphor-teal hover:shadow-glow-teal
                               text-aged-cream/90 text-xs led-text tracking-wider transition-all"
                    >
                      Explore {decade}s
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-crt-medium border border-crt-light/50 rounded px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="led-text text-phosphor-amber text-xs">INPUT</span>
                          </div>
                          <p className="text-aged-cream">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="max-w-full w-full">
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
                            <div className="bg-crt-dark border border-crt-light/30 rounded px-4 py-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="led-text text-phosphor-teal text-xs">OUTPUT</span>
                              </div>
                              <p className="text-aged-cream whitespace-pre-wrap">{message.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && <MessageSkeleton />}
              </div>
            )}
          </div>

          {/* === INPUT AREA: VCR Control Panel === */}
          <form onSubmit={handleSubmit} className="border-t border-crt-light/20 bg-crt-dark p-4">
            <div className="flex gap-3 items-center">
              {/* Tape reels decoration */}
              <div className="hidden md:flex items-center gap-2">
                <div className={`tape-reel ${isLoading ? 'animate-tape-roll' : ''}`} />
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => query.length > 0 && setShowAutocomplete(true)}
                  placeholder="Try your birthday, a year, or any date..."
                  aria-label="Enter a date to search, like your birthday or a year"
                  className="w-full bg-crt-black text-aged-cream placeholder-aged-cream/30 border-2 border-crt-light/40 rounded px-4 py-3 focus:outline-none input-glow transition-all led-text text-lg tracking-wide"
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="rec-indicator led-text text-vhs-red text-sm">
                      SEARCHING
                    </div>
                  </div>
                )}
                <SearchAutocomplete
                  query={query}
                  onSelect={handleSuggestionSelect}
                  isVisible={showAutocomplete}
                  onClose={() => setShowAutocomplete(false)}
                />
              </div>

              <VoiceInput
                onTranscript={handleVoiceTranscript}
                isDisabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="retro-btn px-6 py-3 text-phosphor-teal disabled:text-aged-cream/30 disabled:cursor-not-allowed text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-vhs-red rounded-full animate-pulse" />
                  </span>
                ) : (
                  'PLAY ▶'
                )}
              </button>

              {/* Tape reels decoration */}
              <div className="hidden md:flex items-center gap-2">
                <div className={`tape-reel ${isLoading ? 'animate-tape-roll' : ''}`} />
              </div>
            </div>
          </form>
          </VHSEffect>
        </div>

        {/* === FOOTER === */}
        <footer className="text-center mt-10 space-y-3">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-crt-light/30" />
            <p className="led-text text-aged-cream/70 text-sm tracking-widest">
              POWERED BY ALGOLIA
            </p>
            <div className="h-px w-16 bg-crt-light/30" />
          </div>
          <p className="text-aged-cream/50 text-xs led-text tracking-wider">
            ALGOLIA AGENT STUDIO CHALLENGE 2026
          </p>
          <div className="flex items-center justify-center gap-4 text-xs led-text tracking-wider text-aged-cream/70">
            <Link href="/about" className="hover:text-phosphor-teal transition-colors">
              ABOUT
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/contact" className="hover:text-phosphor-teal transition-colors">
              CONTACT
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/privacy-policy" className="hover:text-phosphor-teal transition-colors">
              PRIVACY
            </Link>
          </div>
        </footer>
      </div>
      
      {/* Modals and Overlays */}
      {showWrapped && wrappedStats && (
        <WrappedCard stats={wrappedStats} onClose={() => setShowWrapped(false)} />
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

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

export default function HomeClient() {
  return <HomeContent />
}
