import { algoliasearch, SearchClient } from 'algoliasearch'

let _client: SearchClient | null = null

function getClient(): SearchClient {
  if (!_client) {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
    const apiKey = process.env.ALGOLIA_SEARCH_API_KEY

    if (!appId || !apiKey) {
      throw new Error('Algolia credentials not configured. Set NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_SEARCH_API_KEY in .env.local')
    }

    _client = algoliasearch(appId, apiKey)
  }
  return _client
}

export interface Song {
  objectID: string
  date: number
  date_string: string
  year: number
  decade: string
  chart_position: number
  song_title: string
  artist: string
  weeks_on_chart?: number
  peak_position?: number
  category: 'music'
}

export interface Movie {
  objectID: string
  tmdb_id?: number
  date: number
  date_string: string
  year: number
  decade: string
  title: string
  overview?: string
  genres?: string[]
  poster_url?: string
  vote_average: number
  popularity?: number
  category: 'movies'
}

export interface Price {
  objectID: string
  date: number
  date_string: string
  year: number
  decade: string
  month: string
  gas_price_gallon?: number
  cpi_index?: number
  minimum_wage?: number
  movie_ticket_price?: number
  inflation_rate?: number
  category: 'prices'
}

export interface HistoricalEvent {
  objectID: string
  date: number
  date_string: string
  year: number
  decade: string
  event_type?: string
  title: string
  description?: string
  category: 'events'
  subcategory?: string
  importance?: string
}

export interface SearchResults {
  songs: Song[]
  movies: Movie[]
  prices: Price[]
  events: HistoricalEvent[]
}

/**
 * Search all TimeSlipSearch indices for a date range
 */
export async function searchAllIndices(
  startTimestamp: number,
  endTimestamp: number
): Promise<SearchResults> {
  const filters = `date >= ${startTimestamp} AND date <= ${endTimestamp}`

  try {
    const client = getClient()
    const [songsResponse, moviesResponse, pricesResponse, eventsResponse] = await Promise.all([
      client.searchSingleIndex({
        indexName: 'timeslip_songs',
        searchParams: {
          query: '',
          filters,
          hitsPerPage: 10,
        },
      }),
      client.searchSingleIndex({
        indexName: 'timeslip_movies',
        searchParams: {
          query: '',
          filters,
          hitsPerPage: 10,
        },
      }),
      client.searchSingleIndex({
        indexName: 'timeslip_prices',
        searchParams: {
          query: '',
          filters,
          hitsPerPage: 1,
        },
      }),
      client.searchSingleIndex({
        indexName: 'timeslip_events',
        searchParams: {
          query: '',
          filters,
          hitsPerPage: 10,
        },
      }),
    ])

    return {
      songs: (songsResponse.hits as unknown as Song[]).sort(
        (a, b) => a.chart_position - b.chart_position
      ),
      movies: (moviesResponse.hits as unknown as Movie[]).sort(
        (a, b) => (b.popularity || 0) - (a.popularity || 0)
      ),
      prices: pricesResponse.hits as unknown as Price[],
      events: eventsResponse.hits as unknown as HistoricalEvent[],
    }
  } catch (error) {
    console.error('Algolia search error:', error)
    return {
      songs: [],
      movies: [],
      prices: [],
      events: [],
    }
  }
}

/**
 * Get the admin client for indexing operations
 */
export function getAdminClient() {
  return algoliasearch(
    process.env.ALGOLIA_APP_ID || '',
    process.env.ALGOLIA_ADMIN_API_KEY || ''
  )
}
