/**
 * TMDB (The Movie Database) Ingestion Script
 *
 * Fetches popular movies by year from TMDB API
 * and indexes them into Algolia.
 *
 * Data source: https://developer.themoviedb.org
 * Coverage: 1900s-present
 *
 * Usage: npm run ingest:tmdb
 */

import { config } from 'dotenv'
import { algoliasearch } from 'algoliasearch'

// Load .env.local
config({ path: '.env.local' })

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

interface TmdbMovie {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string | null
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
}

interface TmdbResponse {
  page: number
  results: TmdbMovie[]
  total_pages: number
  total_results: number
}

interface TmdbGenre {
  id: number
  name: string
}

interface AlgoliaMovie {
  objectID: string
  tmdb_id: number
  date: number
  date_string: string
  year: number
  decade: string
  month: string
  title: string
  overview: string
  genres: string[]
  poster_url: string | null
  vote_average: number
  vote_count: number
  popularity: number
  category: 'movies'
  searchable_text: string
}

function getDecade(year: number): string {
  const decadeStart = Math.floor(year / 10) * 10
  return `${decadeStart}s`
}

function getMonthName(month: number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months[month - 1] || 'Unknown'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchGenres(apiKey: string): Promise<Map<number, string>> {
  const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}`
  const response = await fetch(url)

  if (!response.ok) {
    console.warn('Failed to fetch genres')
    return new Map()
  }

  const data: { genres: TmdbGenre[] } = await response.json()
  return new Map(data.genres.map((g) => [g.id, g.name]))
}

async function fetchMoviesByYear(
  year: number,
  apiKey: string,
  maxPages: number = 5
): Promise<TmdbMovie[]> {
  const movies: TmdbMovie[] = []

  for (let page = 1; page <= maxPages; page++) {
    const url = new URL(`${TMDB_BASE_URL}/discover/movie`)
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('primary_release_year', String(year))
    url.searchParams.set('sort_by', 'popularity.desc')
    url.searchParams.set('page', String(page))
    url.searchParams.set('vote_count.gte', '10') // Filter out obscure movies

    const response = await fetch(url.toString())

    if (!response.ok) {
      console.warn(`Failed to fetch year ${year} page ${page}: ${response.status}`)
      break
    }

    const data: TmdbResponse = await response.json()
    movies.push(...data.results)

    if (page >= data.total_pages) break

    // Rate limit: TMDB allows 40 requests per 10 seconds
    await sleep(250)
  }

  return movies
}

function transformMovie(movie: TmdbMovie, genreMap: Map<number, string>): AlgoliaMovie | null {
  if (!movie.release_date) return null

  const [year, month, day] = movie.release_date.split('-').map(Number)
  if (!year || !month || !day) return null

  const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000)
  const genres = movie.genre_ids.map((id) => genreMap.get(id)).filter(Boolean) as string[]

  return {
    objectID: `movie_${movie.id}`,
    tmdb_id: movie.id,
    date: timestamp,
    date_string: movie.release_date,
    year,
    decade: getDecade(year),
    month: getMonthName(month),
    title: movie.title,
    overview: movie.overview || '',
    genres,
    poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    vote_average: Math.round(movie.vote_average * 10) / 10,
    vote_count: movie.vote_count,
    popularity: movie.popularity,
    category: 'movies',
    searchable_text: `${movie.title} ${year} ${genres.join(' ')} movie film`,
  }
}

async function main() {
  console.log('TMDB Movie Ingestion Script')
  console.log('===========================\n')

  // Check for credentials
  const algoliaAppId = process.env.ALGOLIA_APP_ID
  const algoliaAdminKey = process.env.ALGOLIA_ADMIN_API_KEY
  const tmdbApiKey = process.env.TMDB_API_KEY

  if (!algoliaAppId || !algoliaAdminKey) {
    console.error('Error: Missing Algolia credentials')
    console.error('Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY in .env.local')
    process.exit(1)
  }

  if (!tmdbApiKey) {
    console.error('Error: Missing TMDB API key')
    console.error('Set TMDB_API_KEY in .env.local')
    console.error('Get a free key at: https://www.themoviedb.org/settings/api')
    process.exit(1)
  }

  // Fetch genre mapping
  console.log('Fetching genre list...')
  const genreMap = await fetchGenres(tmdbApiKey)
  console.log(`Got ${genreMap.size} genres\n`)

  // Fetch movies by year
  const START_YEAR = 1950
  const END_YEAR = new Date().getFullYear()
  const records: AlgoliaMovie[] = []

  console.log(`Fetching movies from ${START_YEAR} to ${END_YEAR}...`)
  console.log('This may take several minutes due to rate limiting.\n')

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    process.stdout.write(`\rFetching ${year}...`)

    const movies = await fetchMoviesByYear(year, tmdbApiKey)

    for (const movie of movies) {
      const record = transformMovie(movie, genreMap)
      if (record) records.push(record)
    }

    // Log progress every decade
    if (year % 10 === 9) {
      console.log(`\n${year} complete - ${records.length} movies so far`)
    }
  }

  console.log(`\n\nTotal movies collected: ${records.length}`)

  // Initialize Algolia client
  console.log('\nConnecting to Algolia...')
  const client = algoliasearch(algoliaAppId, algoliaAdminKey)

  // Index records
  const INDEX_NAME = 'timeslip_movies'
  const BATCH_SIZE = 1000

  console.log(`Indexing to: ${INDEX_NAME}`)
  console.log(`Batch size: ${BATCH_SIZE}\n`)

  let indexed = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    await client.saveObjects({
      indexName: INDEX_NAME,
      objects: batch as unknown as Record<string, unknown>[],
    })
    indexed += batch.length
    const progress = ((indexed / records.length) * 100).toFixed(1)
    console.log(`Indexed ${indexed} / ${records.length} (${progress}%)`)
  }

  // Configure index settings
  console.log('\nConfiguring index settings...')
  await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: ['searchable_text', 'title', 'overview'],
      attributesForFaceting: [
        'filterOnly(year)',
        'filterOnly(decade)',
        'filterOnly(date)',
        'filterOnly(category)',
        'genres',
      ],
      customRanking: ['desc(popularity)', 'desc(vote_average)', 'desc(vote_count)'],
    },
  })

  console.log('\nDone! TMDB movie data indexed successfully.')
  console.log(`Total records indexed: ${indexed}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
