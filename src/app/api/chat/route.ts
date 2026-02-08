import { NextRequest, NextResponse } from 'next/server'
import { parseDate, DateRange } from '@/lib/date-parser'
import { searchAllIndices } from '@/lib/algolia'
import type { SearchResults, AdvancedSearchOptions } from '@/lib/algolia'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { getCache, setCache, createCacheKey, CACHE_TTL } from '@/lib/cache'

export interface ChatResponse {
  response: string
  structured?: {
    dateDisplay: string
    year: number
    month?: number
    day?: number
    results: SearchResults
    suggestions?: string[]
    insights?: string[]
    comparisonMode?: boolean
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (async with Redis support)
    const clientId = getClientIdentifier(request)
    const rateLimit = await checkRateLimit(clientId, 30, 60 * 1000) // 30 req/min

    if (!rateLimit.allowed) {
      return NextResponse.json<ChatResponse>({
        response: '',
        error: 'Too many requests. Please try again in a minute.'
      }, {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        }
      })
    }

    // Parse request body with proper error handling
    let body: { message?: unknown; filters?: AdvancedSearchOptions }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json<ChatResponse>({
        response: '',
        error: 'Invalid JSON in request body'
      }, { status: 400 })
    }

    const { message, filters } = body

    // Validate message is a non-empty string
    if (!message || typeof message !== 'string') {
      return NextResponse.json<ChatResponse>({
        response: '',
        error: 'Message must be a non-empty string'
      }, { status: 400 })
    }

    // Validate message length to prevent DoS
    if (message.length > 500) {
      return NextResponse.json<ChatResponse>({
        response: '',
        error: 'Message too long (maximum 500 characters)'
      }, { status: 400 })
    }

    // Validate filters structure if provided
    if (filters !== undefined && (typeof filters !== 'object' || filters === null)) {
      return NextResponse.json<ChatResponse>({
        response: '',
        error: 'Invalid filters format'
      }, { status: 400 })
    }

    // Parse the date from the user's message
    const dateInfo = parseDate(message)

    if (!dateInfo) {
      return NextResponse.json<ChatResponse>({
        response: "I couldn't find a date in your message. Try asking something like 'What was #1 on March 15, 1987?' or 'What was happening in Summer of 69?'"
      })
    }

    // Search all indices for the date with optional filters
    const searchOptions: AdvancedSearchOptions | undefined = filters ? {
      decades: filters.decades,
      chartPositions: filters.chartPositions,
      showOnlyNumber1: filters.showOnlyNumber1
    } : undefined

    // Check cache first
    const cacheKey = createCacheKey(dateInfo.start, dateInfo.end, searchOptions)
    const cachedResults = await getCache<SearchResults>(cacheKey)

    let results: SearchResults
    let fromCache = false

    if (cachedResults) {
      results = cachedResults
      fromCache = true
    } else {
      results = await searchAllIndices(dateInfo.start, dateInfo.end, searchOptions)
      // Cache results for 1 hour
      await setCache(cacheKey, results, CACHE_TTL.SEARCH_RESULTS)
    }

    // Generate AI agent suggestions and insights
    const suggestions = generateSuggestions(dateInfo, results)
    const insights = generateInsights(dateInfo, results)

    // Format the text response
    const response = formatResponse(dateInfo, results)

    // Extract month and day from the start timestamp for famous date matching
    const startDate = new Date(dateInfo.start * 1000)
    const month = startDate.getMonth() + 1
    const day = startDate.getDate()

    // Return both text and structured data with rate limit and cache headers
    return NextResponse.json<ChatResponse>({
      response,
      structured: {
        dateDisplay: dateInfo.display,
        year: dateInfo.year,
        month,
        day,
        results,
        suggestions,
        insights,
      },
    }, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-Cache': fromCache ? 'HIT' : 'MISS',
        'Cache-Control': 'private, max-age=3600',
        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)

    // Check if it's an Algolia credentials error
    if (error instanceof Error && error.message.includes('credentials')) {
      return NextResponse.json<ChatResponse>({
        response: "I'm not fully set up yet. Please configure Algolia credentials in .env.local to enable search.",
        error: 'Configuration required'
      })
    }

    return NextResponse.json<ChatResponse>(
      { response: '', error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatResponse(
  dateInfo: { display: string; year: number },
  results: SearchResults
): string {
  const parts: string[] = []

  parts.push(`Here's what was happening around ${dateInfo.display}:\n`)

  // Music
  if (results.songs.length > 0) {
    parts.push('**Top Music:**')
    const topSongs = results.songs.slice(0, 5)
    topSongs.forEach(song => {
      parts.push(`#${song.chart_position}: "${song.song_title}" by ${song.artist}`)
    })
    parts.push('')
  }

  // Movies
  if (results.movies.length > 0) {
    parts.push('**At the Movies:**')
    results.movies.slice(0, 3).forEach(movie => {
      parts.push(`- ${movie.title} (${movie.vote_average}/10)`)
    })
    parts.push('')
  }

  // Prices
  if (results.prices.length > 0) {
    const price = results.prices[0]
    if (price) {
      parts.push('**Price Check:**')
      if (price.gas_price_gallon) {
        parts.push(`- Gas: $${price.gas_price_gallon.toFixed(2)}/gallon`)
      }
      if (price.minimum_wage) {
        parts.push(`- Minimum wage: $${price.minimum_wage.toFixed(2)}/hour`)
      }
      if (price.movie_ticket_price) {
        parts.push(`- Movie ticket: $${price.movie_ticket_price.toFixed(2)}`)
      }
      parts.push('')
    }
  }

  // Events
  if (results.events.length > 0) {
    parts.push('**What Happened:**')
    results.events.slice(0, 3).forEach(event => {
      parts.push(`- ${event.title}`)
    })
    parts.push('')
  }

  if (parts.length === 1) {
    // Check if date is out of supported range
    if (dateInfo.year < 1958 || dateInfo.year > 2020) {
      return `I found the date ${dateInfo.display}, but my data coverage is best between 1958 and 2020. Try a date in that range for better results!`
    }
    
    // Date is in range but no data found
    return `I found the date ${dateInfo.display}, but I don't have any data indexed for that period yet. The database may need to be populated with historical data. For the best experience, make sure to run the data ingestion scripts (see SETUP.md).`
  }

  parts.push(`Want to know what was #1 on someone else's birthday? Just ask!`)

  return parts.join('\n')
}

function generateSuggestions(
  dateInfo: DateRange,
  results: SearchResults
): string[] {
  const suggestions: string[] = []
  
  // Comparison suggestions
  if (dateInfo.year < 2020) {
    suggestions.push(
      `Compare with ${dateInfo.year + 10}`,
      `See ${dateInfo.year - 10}`
    )
  }
  
  // Decade exploration
  const decade = Math.floor(dateInfo.year / 10) * 10
  suggestions.push(`Explore the entire ${decade}s`)
  
  // Top songs of the year
  if (results.songs.length > 0) {
    suggestions.push(`Top songs of ${dateInfo.year}`)
    const topSong = results.songs[0]
    if (topSong && topSong.artist) {
      suggestions.push(`More by ${topSong.artist}`)
    }
  }
  
  // Random suggestion
  suggestions.push('🎲 Random date')
  
  return suggestions.slice(0, 5)
}

function generateInsights(
  dateInfo: DateRange,
  results: SearchResults
): string[] {
  const insights: string[] = []
  const year = dateInfo.year
  
  // Historical context
  if (year === 1969) {
    insights.push('🌙 The year of the Moon Landing!')
  } else if (year === 1989) {
    insights.push('🧱 The year the Berlin Wall fell')
  } else if (year >= 1980 && year <= 1989) {
    insights.push('📼 The golden age of MTV and cassette tapes')
  } else if (year >= 1990 && year <= 1999) {
    insights.push('💿 The CD era and grunge revolution')
  } else if (year >= 1960 && year <= 1969) {
    insights.push('✌️ The decade of peace, love, and revolution')
  } else if (year >= 1950 && year <= 1959) {
    insights.push('🎸 Rock & Roll was born')
  }
  
  // Music insights
  if (results.songs.length > 0) {
    const topSong = results.songs[0]
    if (topSong && topSong.weeks_on_chart && topSong.weeks_on_chart > 15) {
      insights.push(`💿 #1 song stayed on charts for ${topSong.weeks_on_chart} weeks!`)
    }
    
    // Genre insights (simple detection from artist names)
    const hasMultipleSongs = results.songs.length >= 3
    if (hasMultipleSongs) {
      insights.push(`🎵 ${results.songs.length} songs were charting this week`)
    }
  }
  
  // Price insights
  if (results.prices.length > 0) {
    const price = results.prices[0]
    if (price && price.gas_price_gallon && price.gas_price_gallon < 2) {
      const gasNow = 3.5 // approximate current price
      const increase = Math.round(((gasNow - price.gas_price_gallon) / price.gas_price_gallon) * 100)
      insights.push(`⛽ Gas has increased ${increase}% since then`)
    }
    if (price && price.minimum_wage && price.minimum_wage < 7) {
      insights.push(`💵 Minimum wage was just $${price.minimum_wage.toFixed(2)}/hour`)
    }
  }
  
  // Decade milestones
  if (year % 10 === 0) {
    insights.push(`🎊 Start of a new decade!`)
  }
  
  return insights.slice(0, 3)
}
