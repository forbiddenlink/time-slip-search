'use client'

import { useState, useEffect } from 'react'
import { SearchResults } from '@/lib/algolia'
import { TimeCapsule } from '@/components/results/TimeCapsule'
import { MessageSkeleton } from '@/components/chat/LoadingSkeleton'

interface Message {
  role: 'user' | 'assistant'
  content: string
  structured?: {
    dateDisplay: string
    year: number
    results: SearchResults
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

const featureCards = [
  { icon: '\u266B', label: '#1 Songs', period: '350K+ charts', color: 'text-vinyl-label' },
  { icon: '\u25B6', label: 'Movies', period: '50K+ films', color: 'text-phosphor-amber' },
  { icon: '$', label: 'Prices', period: 'Real costs', color: 'text-phosphor-green' },
  { icon: '\u25C6', label: 'Events', period: '20K+ moments', color: 'text-phosphor-teal' },
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

export default function Home() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState('--:--')

  // Update clock client-side only to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        structured: data.structured,
      }])
    } catch (error) {
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

        {/* === FEATURE CARDS: Cassette Tape Style === */}
        {messages.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {featureCards.map((feature) => (
              <div
                key={feature.label}
                className="vhs-card p-4 group hover:border-crt-light transition-colors"
              >
                <div className="relative z-10 pt-12 text-center">
                  <div className={`text-3xl mb-2 ${feature.color} glow-text-subtle font-mono`}>
                    {feature.icon}
                  </div>
                  <div className="text-sm font-medium text-aged-cream tracking-wide">
                    {feature.label}
                  </div>
                  <div className="text-xs text-aged-cream/40 mt-1 led-text">
                    {feature.period}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* === MAIN CONSOLE: CRT Screen === */}
        <div className="crt-screen shadow-crt border-4 border-crt-medium">
          {/* Screen bezel top */}
          <div className="bg-crt-dark px-6 py-3 border-b border-crt-light/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="led-text text-phosphor-teal text-sm">CH</span>
              <span className="led-text text-phosphor-amber">03</span>
            </div>
            <div className="text-aged-cream/40 text-xs tracking-widest led-text">
              TIMESLIP SEARCH v1.0
            </div>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-4 bg-crt-light/30 rounded-sm" />
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-6 retro-scroll relative z-20">
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
                            <TimeCapsule
                              results={message.structured.results}
                              dateDisplay={message.structured.dateDisplay}
                              year={message.structured.year}
                            />
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
                  onChange={(e) => setQuery(e.target.value)}
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
              </div>

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
    </main>
  )
}
