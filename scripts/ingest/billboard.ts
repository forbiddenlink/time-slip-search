/**
 * Billboard Hot 100 Ingestion Script
 *
 * Downloads Billboard Hot 100 chart data from the GitHub JSON dataset
 * and indexes it into Algolia.
 *
 * Data source: https://github.com/mhollingshead/billboard-hot-100
 * Coverage: 1958-present
 *
 * Usage: npm run ingest:billboard
 */

import { algoliasearch } from 'algoliasearch'

const BILLBOARD_JSON_URL =
  'https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/all.json'

interface BillboardSong {
  song: string
  artist: string
  this_week: number
  last_week: number | null
  peak_position: number
  weeks_on_chart: number
}

interface BillboardWeek {
  date: string // "YYYY-MM-DD"
  data: BillboardSong[]
}

interface FlatEntry {
  date: string
  song: string
  artist: string
  this_week: number
  last_week: number | null
  peak_position: number
  weeks_on_chart: number
}

interface AlgoliaSong {
  objectID: string
  date: number
  date_string: string
  year: number
  decade: string
  month: string
  chart_position: number
  song_title: string
  artist: string
  weeks_on_chart: number
  peak_position: number
  category: 'music'
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
  return months[month - 1]
}

function transformEntry(entry: FlatEntry): AlgoliaSong {
  const [year, month, day] = entry.date.split('-').map(Number)
  const timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000)

  return {
    objectID: `${entry.date}_${String(entry.this_week).padStart(2, '0')}`,
    date: timestamp,
    date_string: entry.date,
    year,
    decade: getDecade(year),
    month: getMonthName(month),
    chart_position: entry.this_week,
    song_title: entry.song,
    artist: entry.artist,
    weeks_on_chart: entry.weeks_on_chart,
    peak_position: entry.peak_position,
    category: 'music',
    searchable_text: `${entry.song} ${entry.artist} ${year} Billboard Hot 100`,
  }
}

async function main() {
  console.log('Billboard Hot 100 Ingestion Script')
  console.log('==================================\n')

  // Check for Algolia credentials
  const appId = process.env.ALGOLIA_APP_ID
  const adminKey = process.env.ALGOLIA_ADMIN_API_KEY

  if (!appId || !adminKey) {
    console.error('Error: Missing Algolia credentials')
    console.error('Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY in .env.local')
    process.exit(1)
  }

  console.log('Fetching Billboard Hot 100 data...')
  console.log(`URL: ${BILLBOARD_JSON_URL}\n`)

  const response = await fetch(BILLBOARD_JSON_URL)
  if (!response.ok) {
    console.error(`Failed to fetch data: ${response.status} ${response.statusText}`)
    process.exit(1)
  }

  const weeks: BillboardWeek[] = await response.json()
  console.log(`Fetched ${weeks.length.toLocaleString()} chart weeks\n`)

  // Flatten weeks into individual song entries
  console.log('Flattening data...')
  const flatEntries: FlatEntry[] = weeks.flatMap((week) =>
    week.data.map((song) => ({
      date: week.date,
      song: song.song,
      artist: song.artist,
      this_week: song.this_week,
      last_week: song.last_week,
      peak_position: song.peak_position,
      weeks_on_chart: song.weeks_on_chart,
    }))
  )
  console.log(`Flattened to ${flatEntries.length.toLocaleString()} song entries\n`)

  // Transform all entries
  console.log('Transforming data...')
  const records = flatEntries.map(transformEntry)

  // Get date range
  const years = Array.from(new Set(records.map((r) => r.year))).sort((a, b) => a - b)
  console.log(`Date range: ${years[0]} - ${years[years.length - 1]}`)
  console.log(`Total records: ${records.length.toLocaleString()}\n`)

  // Initialize Algolia client
  console.log('Connecting to Algolia...')
  const client = algoliasearch(appId, adminKey)

  // Index in batches
  const INDEX_NAME = 'timeslip_songs'
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
    console.log(`Indexed ${indexed.toLocaleString()} / ${records.length.toLocaleString()} (${progress}%)`)
  }

  // Configure index settings
  console.log('\nConfiguring index settings...')
  await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: ['searchable_text', 'song_title', 'artist'],
      attributesForFaceting: ['filterOnly(year)', 'filterOnly(decade)', 'filterOnly(date)', 'filterOnly(category)'],
      customRanking: ['asc(chart_position)', 'desc(weeks_on_chart)'],
      ranking: ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
    },
  })

  console.log('\nDone! Billboard Hot 100 data indexed successfully.')
  console.log(`Total records indexed: ${indexed.toLocaleString()}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
