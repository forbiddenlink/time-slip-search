import { NextRequest, NextResponse } from 'next/server'
import { parseDate } from '@/lib/date-parser'
import { searchAllIndices, SearchResults } from '@/lib/algolia'

export interface ChatResponse {
  response: string
  structured?: {
    dateDisplay: string
    year: number
    results: SearchResults
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json<ChatResponse>({
        response: '',
        error: 'Message is required'
      }, { status: 400 })
    }

    // Parse the date from the user's message
    const dateInfo = parseDate(message)

    if (!dateInfo) {
      return NextResponse.json<ChatResponse>({
        response: "I couldn't find a date in your message. Try asking something like 'What was #1 on March 15, 1987?' or 'What was happening in Summer of 69?'"
      })
    }

    // Search all indices for the date
    const results = await searchAllIndices(dateInfo.start, dateInfo.end)

    // Format the text response
    const response = formatResponse(dateInfo, results)

    // Return both text and structured data
    return NextResponse.json<ChatResponse>({
      response,
      structured: {
        dateDisplay: dateInfo.display,
        year: dateInfo.year,
        results,
      },
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

  // Events
  if (results.events.length > 0) {
    parts.push('**What Happened:**')
    results.events.slice(0, 3).forEach(event => {
      parts.push(`- ${event.title}`)
    })
    parts.push('')
  }

  if (parts.length === 1) {
    return `I found the date ${dateInfo.display}, but I don't have much data for that period yet. Try a date between 1958 and 2020 for the best results!`
  }

  parts.push(`Want to know what was #1 on someone else's birthday? Just ask!`)

  return parts.join('\n')
}
