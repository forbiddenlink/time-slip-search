'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchResults } from '@/lib/algolia'
import { TimeCapsule } from '@/components/results/TimeCapsule'
import { MessageSkeleton } from '@/components/chat/LoadingSkeleton'
import { AgentMemoryPanel } from '@/components/memory/AgentMemoryPanel'
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete'
import { VoiceInput } from '@/components/input/VoiceInput'
import { SearchHistory } from '@/lib/agent-memory'
import { Timeline } from '@/components/Timeline'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { encodeSearchToURL, decodeURLToSearch } from '@/lib/url-state'
import { WrappedCard } from '@/components/wrapped/WrappedCard'
import { AchievementsPanel } from '@/components/achievements/AchievementsPanel'
import { AchievementToast } from '@/components/achievements/AchievementToast'
import { VHSEffect, VHSRewindEffect } from '@/components/animations/VHSEffect'
import { ParticleEffect } from '@/components/animations/ParticleEffect'
import { trackSearch, getWrappedStats, type WrappedStats } from '@/lib/wrapped'
import { checkAchievements, updateStreak, type Achievement } from '@/lib/achievements'
import { GiftIcon, TrophyIcon, FilmIcon, SparklesIcon, MusicIcon, DollarIcon, CalendarIcon } from '@/components/icons/Icons'

interface Message {
  role: 'user' | 'assistant'
  content: string
  structured?: {
    dateDisplay: string
    year: number
    results: SearchResults
    suggestions?: string[]
    insights?: string[]
  }
}

// Hoisted outside component to prevent recreation on each render (rerender-memo-with-default-value)
// Copy optimized for emotional connection and specificity
const exampleQueries = [
  { text: "What was #1 the day I was born?", query: "March 15, 1987" },
  { text: "Take me back to Summer of '69", query: "Summer of 69" },
  { text: "What did things cost at Christmas?", query: "December 1985" },
  { text: "The day the Berlin Wall fell", query: "November 9, 1989" },
] as const

// Feature cards with professional components
const featureCardsData = [
  { IconComponent: MusicIcon, label: '#1 Songs', period: '350K+ charts', color: 'text-vinyl-label' },
  { IconComponent: FilmIcon, label: 'Movies', period: '50K+ films', color: 'text-phosphor-amber' },
  { IconComponent: DollarIcon, label: 'Prices', period: 'Real costs', color: 'text-phosphor-green' },
  { IconComponent: CalendarIcon, label: 'Events', period: '20K+ moments', color: 'text-phosphor-teal' },
] as const

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'TimeSlipSearch',
  description: 'Explore any moment in history through conversation. Discover what songs, movies, prices, and events defined any date.',
  url: 'https://timeslipsearch.vercel.app',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'Billboard Hot 100 chart history (1958-present)',
    'Movie releases by date',
    'Historical prices and wages',
    'Historical events from Wikimedia',
  ],
  author: {
    '@type': 'Organization',
    name: 'TimeSlipSearch',
  },
}

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
        alert('⌨️ Keyboard Shortcuts:\n\n' +
          '⌘K - Focus search\n' +
          '⌘T - Toggle timeline\n' +
          '⌘W - View Time Capsule (Wrapped)\n' +
          '⌘B - View Achievements (Badges)\n' +
          '⌘E - Toggle VHS effect\n' +
          '⌘P - Toggle particles\n' +
          '⌘/ - Show this help\n' +
          'Esc - Clear search / Close modals\n' +
          '↑↓ - Navigate suggestions')
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
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.'
      }])
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

  const handleCompare = async (targetYear: number) => {
    // Generate a query for the comparison year
    const comparisonQuery = `Year ${targetYear}`
    setMessages(prev => [...prev, { role: 'user', content: comparisonQuery }])
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
    } catch (error) {
      console.error('Comparison error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that comparison.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRandom = async () => {
    // Generate a random date between 1958 and 2020
    const randomYear = Math.floor(Math.random() * (2020 - 1958 + 1)) + 1958
    const randomMonth = Math.floor(Math.random() * 12) + 1
    const randomDay = Math.floor(Math.random() * 28) + 1 // Keep it simple, avoid edge cases
    const randomDate = `${randomMonth}/${randomDay}/${randomYear}`
    
    setMessages(prev => [...prev, { role: 'user', content: `🎲 Random: ${randomDate}` }])
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
    } catch (error) {
      console.error('Random date error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble with that random date.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-crt-black">
      {/* JSON-LD Structured Data for SEO - static content, safe to use */}
      <script
        type="application/ld+json"
        // Safe: jsonLd is a static constant defined at module level with no user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className="text-center space-y-4">
            <h1 className="font-display text-5xl md:text-7xl tracking-tight">
              <span className="text-aged-cream chromatic-hover">Time</span>
              <span className="text-phosphor-teal glow-text-subtle">Slip</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent via-crt-light to-transparent" />
              <p className="led-text text-phosphor-amber text-xl tracking-[0.3em] uppercase">
                Search
              </p>
              <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent via-crt-light to-transparent" />
            </div>
            <p className="text-aged-cream/60 text-lg italic font-body">
              Discover what was playing, showing, and happening on any date
            </p>
          </div>
        </header>

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {featureCardsData.map((feature) => {
              const IconComponent = feature.IconComponent
              return (
                <div
                  key={feature.label}
                  className="vhs-card p-4 group hover:border-crt-light transition-colors cursor-pointer hover:scale-105"
                >
                  <div className="relative z-10 pt-12 text-center">
                    <div className={`mb-3 flex justify-center ${feature.color} glow-text-subtle`}>
                      <IconComponent size={32} />
                    </div>
                    <div className="text-sm font-medium text-aged-cream tracking-wide">
                      {feature.label}
                    </div>
                    <div className="text-xs text-aged-cream/40 mt-1 led-text">
                      {feature.period}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        {/* === MAIN CONSOLE: CRT Screen === */}
        <div className="crt-screen shadow-crt border-4 border-crt-medium relative">
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
              <div className="text-aged-cream/40 text-xs tracking-widest led-text">
                TIMESLIP SEARCH v1.0
              </div>
              <div className="flex gap-2">
                {/* Time Capsule Button */}
                <button
                  onClick={() => {
                    setWrappedStats(getWrappedStats())
                    setShowWrapped(true)
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
                  title="View Your Time Capsule"
                  aria-label="View Your Time Capsule"
                >
                  <GiftIcon size={16} />
                  <span>Wrapped</span>
                </button>
                
                {/* Achievements Button */}
                <button
                  onClick={() => setShowAchievements(true)}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
                  title="View Achievements"
                  aria-label="View Achievements"
                >
                  <TrophyIcon size={16} />
                  <span>Badges</span>
                </button>
                
                {/* VHS Effect Toggle */}
                <button
                  onClick={() => setShowVHSEffect(!showVHSEffect)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1.5 ${
                    showVHSEffect
                      ? 'bg-vhs-red text-white shadow-lg'
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
                      ? 'bg-purple-600 text-white shadow-lg'
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
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-6 retro-scroll relative z-20">\n
            {messages.length === 0 ? (
              <div className="text-center">
                <p className="text-aged-cream/80 mb-2 text-xl font-body italic">
                  What was the world like on your birthday?
                </p>
                <p className="text-aged-cream/50 mb-8 text-sm font-body">
                  Enter any date from 1958 to 2020
                </p>

                {/* Example queries as tape labels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example.query)}
                      className="group text-left p-4 bg-crt-dark border border-crt-light/30 rounded hover:border-phosphor-teal/50 transition-all duration-300 hover:shadow-glow-teal"
                    >
                      <div className="flex items-start gap-3">
                        <span className="led-text text-phosphor-amber text-lg shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-aged-cream group-hover:text-phosphor-teal transition-colors">
                            {example.text}
                          </span>
                          <span className="text-aged-cream/40 text-xs mt-1 led-text">
                            {example.query}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <p className="mt-8 text-sm text-aged-cream/40 led-text tracking-wide">
                  ALSO TRY: &quot;SUMMER OF 69&quot; &bull; &quot;THE 80S&quot; &bull; &quot;CHRISTMAS 1992&quot;
                </p>

                {/* Random Date Quick Action */}
                <div className="mt-6">
                  <button
                    onClick={handleRandom}
                    className="px-6 py-3 bg-crt-dark border border-phosphor-green/30 
                             rounded hover:border-phosphor-green hover:shadow-glow-green
                             text-aged-cream transition-all hover-lift led-text"
                  >
                    🎲 SURPRISE ME WITH A RANDOM DATE
                  </button>
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
                                insights={message.structured.insights}
                                onCompare={handleCompare}
                                onRandom={handleRandom}
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
                  className="w-full bg-crt-black text-aged-cream placeholder-aged-cream/30 border-2 border-crt-light/40 rounded px-4 py-3 focus:outline-none focus:border-phosphor-teal focus:shadow-glow-teal transition-all led-text text-lg tracking-wide"
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
            <p className="led-text text-aged-cream/50 text-sm tracking-widest">
              POWERED BY ALGOLIA
            </p>
            <div className="h-px w-16 bg-crt-light/30" />
          </div>
          <p className="text-aged-cream/30 text-xs led-text tracking-wider">
            ALGOLIA AGENT STUDIO CHALLENGE 2026
          </p>
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
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-retro-panel" />}>
      <HomeContent />
    </Suspense>
  )
}
