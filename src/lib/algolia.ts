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
  /** date_string (YYYY-MM-DD) of the single Billboard chart week the songs come from. Unset when songs span a range. */
  chartWeek?: string
  movies: Movie[]
  prices: Price[]
  events: HistoricalEvent[]
}

export interface AdvancedSearchOptions {
  decades?: string[]
  chartPositions?: string[]
  showOnlyNumber1?: boolean
}

// Attributes to retrieve per index (reduces payload size)
const SONG_ATTRIBUTES = [
  'objectID', 'date', 'date_string', 'year', 'decade',
  'chart_position', 'song_title', 'artist', 'weeks_on_chart', 'peak_position', 'category'
]

const MOVIE_ATTRIBUTES = [
  'objectID', 'tmdb_id', 'date', 'date_string', 'year', 'decade',
  'title', 'overview', 'genres', 'poster_url', 'vote_average', 'popularity', 'category'
]

const EVENT_ATTRIBUTES = [
  'objectID', 'date', 'date_string', 'year', 'decade',
  'event_type', 'title', 'description', 'category', 'importance'
]

const DAY_SECONDS = 24 * 60 * 60
const SONGS_PER_CHART = 5
// Movies only carry a release date, so a +/- 3 day window almost never matches.
// Show films released in the 4 weeks before the date through the week after.
const MOVIE_DAYS_BEFORE = 28
const MOVIE_DAYS_AFTER = 7

/** Chart week (from a list of weekly chart timestamps) nearest to the anchor. */
export function pickNearestChartWeek(
  weeks: Array<{ date: number; date_string: string }>,
  anchor: number
): { date: number; date_string: string } | undefined {
  let best: { date: number; date_string: string } | undefined
  for (const week of weeks) {
    if (!best || Math.abs(week.date - anchor) < Math.abs(best.date - anchor)) best = week
  }
  return best
}

/** Keep the best-ranked entry per song so one chart-topper cannot fill every slot. */
export function dedupeSongs(songs: Song[]): Song[] {
  const seen = new Set<string>()
  const out: Song[] = []
  for (const song of [...songs].sort((a, b) => a.chart_position - b.chart_position)) {
    const key = `${song.song_title}|${song.artist}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(song)
  }
  return out
}

/** Window used for the movies index: release date range around the requested date. */
export function getMovieWindow(
  startTimestamp: number,
  endTimestamp: number,
  anchor?: number,
  isSingleDay = false
): { start: number; end: number } {
  if (isSingleDay && anchor !== undefined) {
    return { start: anchor - MOVIE_DAYS_BEFORE * DAY_SECONDS, end: anchor + MOVIE_DAYS_AFTER * DAY_SECONDS }
  }
  return { start: startTimestamp, end: endTimestamp }
}

/**
 * Search all TimeSlipSearch indices for a date range with advanced filters
 * Uses batched multi-index search for efficiency.
 *
 * `anchor` is the timestamp the user actually asked about. When given, songs come
 * from the single weekly chart nearest to it (exposed as `chartWeek`). Without it
 * (date ranges), songs are de-duplicated across weeks instead.
 */
export async function searchAllIndices(
  startTimestamp: number,
  endTimestamp: number,
  options?: AdvancedSearchOptions,
  anchor?: number,
  isSingleDay = false
): Promise<SearchResults> {
  let baseFilters = `date >= ${startTimestamp} AND date <= ${endTimestamp}`

  // Add decade filters if specified
  let decadeClause = ''
  if (options?.decades && options.decades.length > 0) {
    const decadeFilters = options.decades.map(d => `decade:"${d}"`).join(' OR ')
    decadeClause = ` AND (${decadeFilters})`
    baseFilters += decadeClause
  }

  const movieWindow = getMovieWindow(startTimestamp, endTimestamp, anchor, isSingleDay)
  const movieFilters = `date >= ${movieWindow.start} AND date <= ${movieWindow.end}${decadeClause}`

  // Song-specific filters (chart position only applies to songs)
  let songExtra = ''
  // chart_position is a numeric attribute, not a facet, in the songs index (scripts/ingest/billboard.ts).
  // Facet syntax (`chart_position:1`) silently matches nothing; numeric comparison is required.
  if (options?.showOnlyNumber1) {
    songExtra = ' AND chart_position = 1'
  } else if (options?.chartPositions && options.chartPositions.length > 0) {
    if (options.chartPositions.includes('top10')) {
      songExtra = ' AND chart_position <= 10'
    } else if (options.chartPositions.includes('top40')) {
      songExtra = ' AND chart_position <= 40'
    }
  }
  // Without an anchor or with a #1-only filter, song hits span several weeks: fetch more, then dedupe.
  const singleWeek = anchor !== undefined && !options?.showOnlyNumber1

  console.log('[Algolia] Searching with filters:', baseFilters)

  try {
    const client = getClient()

    // Single batched request to all indices. For a single chart week we also ask for
    // the #1 of every week in the window, to discover which weeks exist.
    const response = await client.search({
      requests: [
        singleWeek
          ? {
              indexName: 'timeslip_songs',
              query: '',
              filters: `${baseFilters} AND chart_position = 1`,
              hitsPerPage: 1000,
              attributesToRetrieve: ['date', 'date_string'],
            }
          : {
              indexName: 'timeslip_songs',
              query: '',
              filters: baseFilters + songExtra,
              hitsPerPage: 30,
              attributesToRetrieve: SONG_ATTRIBUTES,
            },
        {
          indexName: 'timeslip_movies',
          query: '',
          filters: movieFilters,
          hitsPerPage: 3,
          attributesToRetrieve: MOVIE_ATTRIBUTES,
        },
        {
          indexName: 'timeslip_prices',
          query: '',
          filters: baseFilters,
          hitsPerPage: 1,
          attributesToRetrieve: ['*'], // Small payload, retrieve all
        },
        {
          indexName: 'timeslip_events',
          query: '',
          filters: baseFilters,
          hitsPerPage: 3,
          attributesToRetrieve: EVENT_ATTRIBUTES,
        },
      ],
    })

    // Extract hits from each result (type assertions needed due to Algolia's union types)
    const results = response.results as Array<{ hits: unknown[]; nbHits: number }>
    const [songsResponse, moviesResponse, pricesResponse, eventsResponse] = results

    console.log('[Algolia] Songs found:', songsResponse?.nbHits ?? 0)
    console.log('[Algolia] Movies found:', moviesResponse?.nbHits ?? 0)
    console.log('[Algolia] Prices found:', pricesResponse?.nbHits ?? 0)
    console.log('[Algolia] Events found:', eventsResponse?.nbHits ?? 0)

    let songs: Song[]
    let chartWeek: string | undefined

    if (singleWeek) {
      const week = pickNearestChartWeek(
        (songsResponse?.hits ?? []) as Array<{ date: number; date_string: string }>,
        anchor as number
      )
      if (week) {
        const weekResponse = await client.search({
          requests: [
            {
              indexName: 'timeslip_songs',
              query: '',
              filters: `date = ${week.date}${decadeClause}${songExtra}`,
              hitsPerPage: SONGS_PER_CHART,
              attributesToRetrieve: SONG_ATTRIBUTES,
            },
          ],
        })
        const weekHits = (weekResponse.results as Array<{ hits: unknown[] }>)[0]?.hits ?? []
        songs = (weekHits as Song[]).sort((a, b) => a.chart_position - b.chart_position)
        chartWeek = week.date_string
      } else {
        // No chart week discovered: fall back to de-duplicated songs across the window rather
        // than returning none, so a discovery miss can never blank out the song results.
        const fallback = await client.search({
          requests: [
            {
              indexName: 'timeslip_songs',
              query: '',
              filters: baseFilters + songExtra,
              hitsPerPage: 30,
              attributesToRetrieve: SONG_ATTRIBUTES,
            },
          ],
        })
        const fallbackHits = (fallback.results as Array<{ hits: unknown[] }>)[0]?.hits ?? []
        songs = dedupeSongs(fallbackHits as Song[]).slice(0, SONGS_PER_CHART)
      }
    } else {
      songs = dedupeSongs((songsResponse?.hits ?? []) as Song[]).slice(0, SONGS_PER_CHART)
    }

    return {
      songs,
      ...(chartWeek ? { chartWeek } : {}),
      movies: ((moviesResponse?.hits ?? []) as Movie[]).sort(
        (a, b) => (b.popularity || 0) - (a.popularity || 0)
      ),
      prices: (pricesResponse?.hits ?? []) as Price[],
      events: (eventsResponse?.hits ?? []) as HistoricalEvent[],
    }
  } catch (error) {
    console.error('[Algolia] Search error:', error)
    return {
      songs: [],
      movies: [],
      prices: [],
      events: [],
    }
  }
}

/**
 * Records-per-year density across all archive indices, from Algolia `year` facet counts.
 * Powers the density-weighted timeline scrubber. Read-only aggregation — does not touch
 * the search path. Returns an empty map on any failure so callers can fall back gracefully.
 */
export async function getYearDensity(): Promise<Record<number, number>> {
  try {
    const client = getClient()

    const response = await client.search({
      requests: [
        { indexName: 'timeslip_songs', query: '', facets: ['year'], hitsPerPage: 0, maxValuesPerFacet: 1000 },
        { indexName: 'timeslip_movies', query: '', facets: ['year'], hitsPerPage: 0, maxValuesPerFacet: 1000 },
        { indexName: 'timeslip_prices', query: '', facets: ['year'], hitsPerPage: 0, maxValuesPerFacet: 1000 },
        { indexName: 'timeslip_events', query: '', facets: ['year'], hitsPerPage: 0, maxValuesPerFacet: 1000 },
      ],
    })

    const results = response.results as Array<{ facets?: Record<string, Record<string, number>> }>
    const density: Record<number, number> = {}

    for (const result of results) {
      const yearFacet = result?.facets?.year
      if (!yearFacet) continue
      for (const [yearStr, count] of Object.entries(yearFacet)) {
        const year = Number(yearStr)
        if (!Number.isFinite(year)) continue
        density[year] = (density[year] ?? 0) + count
      }
    }

    return density
  } catch (error) {
    console.error('[Algolia] Year density error:', error)
    return {}
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
