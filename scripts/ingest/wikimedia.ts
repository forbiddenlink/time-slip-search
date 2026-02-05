/**
 * Wikimedia "On This Day" Events Ingestion Script
 *
 * Fetches historical events from Wikimedia Feed API
 * and indexes them into Algolia.
 *
 * Data source: https://api.wikimedia.org/wiki/Feed_API/Reference/On_this_day
 * Coverage: All historical dates
 *
 * Usage: npm run ingest:wikimedia
 */

import { config } from 'dotenv'
import { algoliasearch } from 'algoliasearch'

// Load .env.local
config({ path: '.env.local' })

const WIKIMEDIA_BASE_URL = 'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday'

interface WikimediaPage {
  title: string
  extract?: string
  description?: string
}

interface WikimediaEvent {
  text: string
  year: number
  pages?: WikimediaPage[]
}

interface WikimediaResponse {
  selected?: WikimediaEvent[]
  events?: WikimediaEvent[]
  births?: WikimediaEvent[]
  deaths?: WikimediaEvent[]
  holidays?: WikimediaEvent[]
}

interface AlgoliaEvent {
  objectID: string
  date: number
  date_string: string
  year: number
  decade: string
  month: string
  day: number
  event_type: string
  title: string
  description: string
  category: 'events'
  importance: string
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

async function fetchOnThisDay(month: number, day: number): Promise<WikimediaResponse | null> {
  const url = `${WIKIMEDIA_BASE_URL}/all/${month}/${day}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TimeSlipSearch/1.0 (https://github.com/timeslipsearch)',
      },
    })

    if (!response.ok) {
      console.warn(`Failed to fetch ${month}/${day}: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.warn(`Error fetching ${month}/${day}:`, error)
    return null
  }
}

function transformEvent(
  event: WikimediaEvent,
  eventType: string,
  month: number,
  day: number
): AlgoliaEvent | null {
  // Skip events before 1900 for relevance
  if (event.year < 1900) return null

  const dateStr = `${event.year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const timestamp = Math.floor(new Date(event.year, month - 1, day).getTime() / 1000)

  // Create a clean title from the text
  const title = event.text.length > 150 ? event.text.substring(0, 147) + '...' : event.text

  // Get description from linked page if available
  const description = event.pages?.[0]?.extract || event.pages?.[0]?.description || event.text

  return {
    objectID: `event_${dateStr}_${eventType}_${event.year}`,
    date: timestamp,
    date_string: dateStr,
    year: event.year,
    decade: getDecade(event.year),
    month: getMonthName(month),
    day,
    event_type: eventType,
    title,
    description: description.length > 500 ? description.substring(0, 497) + '...' : description,
    category: 'events',
    importance: eventType === 'selected' ? 'major' : 'standard',
    searchable_text: `${event.year} ${getMonthName(month)} ${title} ${eventType}`,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('Wikimedia Events Ingestion Script')
  console.log('==================================\n')

  // Check for credentials
  const algoliaAppId = process.env.ALGOLIA_APP_ID
  const algoliaAdminKey = process.env.ALGOLIA_ADMIN_API_KEY

  if (!algoliaAppId || !algoliaAdminKey) {
    console.error('Error: Missing Algolia credentials')
    console.error('Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY in .env.local')
    process.exit(1)
  }

  const records: AlgoliaEvent[] = []

  // Days in each month (non-leap year)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  console.log('Fetching events for all 366 days of the year...')
  console.log('This may take a few minutes due to rate limiting.\n')

  for (let month = 1; month <= 12; month++) {
    const maxDay = month === 2 ? 29 : (daysInMonth[month - 1] ?? 30) // Include Feb 29

    for (let day = 1; day <= maxDay; day++) {
      process.stdout.write(`\rFetching ${getMonthName(month)} ${day}...`)

      const data = await fetchOnThisDay(month, day)

      if (data) {
        // Process selected events (most important)
        if (data.selected) {
          for (const event of data.selected) {
            const record = transformEvent(event, 'selected', month, day)
            if (record) records.push(record)
          }
        }

        // Process general events (limit to keep size manageable)
        if (data.events) {
          for (const event of data.events.slice(0, 10)) {
            const record = transformEvent(event, 'historical', month, day)
            if (record) records.push(record)
          }
        }

        // Process births (notable people)
        if (data.births) {
          for (const event of data.births.slice(0, 5)) {
            const record = transformEvent(event, 'birth', month, day)
            if (record) records.push(record)
          }
        }

        // Process deaths (notable people)
        if (data.deaths) {
          for (const event of data.deaths.slice(0, 3)) {
            const record = transformEvent(event, 'death', month, day)
            if (record) records.push(record)
          }
        }
      }

      // Rate limit: be nice to Wikimedia API
      await sleep(100)
    }

    console.log(`\n${getMonthName(month)} complete - ${records.length} events so far`)
  }

  console.log(`\nTotal events collected: ${records.length}`)

  // Initialize Algolia client
  console.log('\nConnecting to Algolia...')
  const client = algoliasearch(algoliaAppId, algoliaAdminKey)

  // Index records
  const INDEX_NAME = 'timeslip_events'
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
      searchableAttributes: ['searchable_text', 'title', 'description'],
      attributesForFaceting: [
        'filterOnly(year)',
        'filterOnly(decade)',
        'filterOnly(date)',
        'filterOnly(category)',
        'filterOnly(event_type)',
        'filterOnly(importance)',
      ],
      customRanking: ['desc(importance)', 'desc(year)'],
    },
  })

  console.log('\nDone! Wikimedia events indexed successfully.')
  console.log(`Total records indexed: ${indexed}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
