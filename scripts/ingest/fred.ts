/**
 * FRED (Federal Reserve Economic Data) Ingestion Script
 *
 * Fetches historical price data (gas prices, CPI) from FRED API
 * and indexes it into Algolia.
 *
 * Data source: https://fred.stlouisfed.org
 * Coverage: 1976-present for gas, 1947-present for CPI
 *
 * Usage: npm run ingest:fred
 */

import { config } from 'dotenv'
import { algoliasearch } from 'algoliasearch'

// Load .env.local
config({ path: '.env.local' })

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations'

// FRED series IDs
const SERIES = {
  GAS_PRICE: 'GASREGW', // Regular Gas Price, Weekly
  CPI: 'CPIAUCSL', // Consumer Price Index for All Urban Consumers
  MINIMUM_WAGE: 'FEDMINNFRWG', // Federal Minimum Wage
}

// Historical minimum wage data (FRED only has recent data)
const MINIMUM_WAGE_HISTORY: Record<number, number> = {
  1938: 0.25,
  1939: 0.3,
  1945: 0.4,
  1950: 0.75,
  1956: 1.0,
  1961: 1.15,
  1963: 1.25,
  1967: 1.4,
  1968: 1.6,
  1974: 2.0,
  1975: 2.1,
  1976: 2.3,
  1978: 2.65,
  1979: 2.9,
  1980: 3.1,
  1981: 3.35,
  1990: 3.8,
  1991: 4.25,
  1996: 4.75,
  1997: 5.15,
  2007: 5.85,
  2008: 6.55,
  2009: 7.25,
}

// Historical movie ticket prices (approximate averages)
const MOVIE_TICKET_PRICES: Record<number, number> = {
  1950: 0.46,
  1955: 0.5,
  1960: 0.69,
  1965: 1.01,
  1970: 1.55,
  1975: 2.05,
  1980: 2.69,
  1985: 3.55,
  1990: 4.23,
  1995: 4.35,
  2000: 5.39,
  2005: 6.41,
  2010: 7.89,
  2015: 8.43,
  2020: 9.16,
}

interface FredObservation {
  date: string
  value: string
}

interface FredResponse {
  observations: FredObservation[]
}

interface AlgoliaPrice {
  objectID: string
  date: number
  date_string: string
  year: number
  decade: string
  month: string
  gas_price_gallon: number | null
  cpi_index: number | null
  minimum_wage: number | null
  movie_ticket_price: number | null
  category: 'prices'
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

function getMinimumWage(year: number): number | null {
  const years = Object.keys(MINIMUM_WAGE_HISTORY)
    .map(Number)
    .sort((a, b) => a - b)
  let wage: number | null = null

  for (const y of years) {
    if (y <= year) {
      wage = MINIMUM_WAGE_HISTORY[y] ?? null
    } else {
      break
    }
  }

  return wage
}

function getMovieTicketPrice(year: number): number | null {
  const years = Object.keys(MOVIE_TICKET_PRICES)
    .map(Number)
    .sort((a, b) => a - b)

  // Find closest year
  let closestYear = years[0] ?? 0
  for (const y of years) {
    if (Math.abs(y - year) < Math.abs(closestYear - year)) {
      closestYear = y
    }
  }

  // Linear interpolation between known years
  const idx = years.indexOf(closestYear)
  if (year === closestYear) {
    return MOVIE_TICKET_PRICES[closestYear] ?? null
  }

  if (year < closestYear && idx > 0) {
    const prevYear = years[idx - 1]
    const prevPrice = MOVIE_TICKET_PRICES[prevYear ?? 0]
    const nextPrice = MOVIE_TICKET_PRICES[closestYear]
    if (!prevPrice || !nextPrice || !prevYear) return null
    const ratio = (year - prevYear) / (closestYear - prevYear)
    return Math.round((prevPrice + ratio * (nextPrice - prevPrice)) * 100) / 100
  }

  if (year > closestYear && idx < years.length - 1) {
    const nextYear = years[idx + 1]
    const prevPrice = MOVIE_TICKET_PRICES[closestYear]
    const nextPrice = MOVIE_TICKET_PRICES[nextYear ?? 0]
    if (!prevPrice || !nextPrice || !nextYear) return null
    const ratio = (year - closestYear) / (nextYear - closestYear)
    return Math.round((prevPrice + ratio * (nextPrice - prevPrice)) * 100) / 100
  }

  return MOVIE_TICKET_PRICES[closestYear] ?? null
}

async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  startDate: string = '1950-01-01'
): Promise<Map<string, number>> {
  const url = new URL(FRED_BASE_URL)
  url.searchParams.set('series_id', seriesId)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('file_type', 'json')
  url.searchParams.set('observation_start', startDate)
  url.searchParams.set('frequency', 'm') // Monthly

  console.log(`Fetching ${seriesId}...`)
  const response = await fetch(url.toString())

  if (!response.ok) {
    console.warn(`Failed to fetch ${seriesId}: ${response.status}`)
    return new Map()
  }

  const data: FredResponse = await response.json()
  const result = new Map<string, number>()

  for (const obs of data.observations) {
    if (obs.value !== '.') {
      const value = parseFloat(obs.value)
      if (!isNaN(value)) {
        // Convert to YYYY-MM format for monthly grouping
        const monthKey = obs.date.substring(0, 7)
        result.set(monthKey, value)
      }
    }
  }

  console.log(`  Got ${result.size} monthly observations`)
  return result
}

async function main() {
  console.log('FRED Economic Data Ingestion Script')
  console.log('====================================\n')

  // Check for credentials
  const algoliaAppId = process.env.ALGOLIA_APP_ID
  const algoliaAdminKey = process.env.ALGOLIA_ADMIN_API_KEY
  const fredApiKey = process.env.FRED_API_KEY

  if (!algoliaAppId || !algoliaAdminKey) {
    console.error('Error: Missing Algolia credentials')
    console.error('Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY in .env.local')
    process.exit(1)
  }

  if (!fredApiKey) {
    console.error('Error: Missing FRED API key')
    console.error('Set FRED_API_KEY in .env.local')
    console.error('Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html')
    process.exit(1)
  }

  // Fetch FRED data
  console.log('Fetching FRED data...\n')
  const gasData = await fetchFredSeries(SERIES.GAS_PRICE, fredApiKey, '1976-01-01')
  const cpiData = await fetchFredSeries(SERIES.CPI, fredApiKey, '1950-01-01')

  // Generate monthly records from 1950 to present
  const records: AlgoliaPrice[] = []
  const startYear = 1950
  const endYear = new Date().getFullYear()

  console.log(`\nGenerating monthly records from ${startYear} to ${endYear}...`)

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`
      const dateStr = `${monthKey}-01`
      const timestamp = Math.floor(new Date(year, month - 1, 1).getTime() / 1000)

      const gasPrice = gasData.get(monthKey) ?? null
      const cpi = cpiData.get(monthKey) ?? null
      const minWage = getMinimumWage(year)
      const movieTicket = getMovieTicketPrice(year)

      // Skip if we have no data for this month
      if (gasPrice === null && cpi === null && minWage === null) {
        continue
      }

      records.push({
        objectID: `prices_${monthKey}`,
        date: timestamp,
        date_string: dateStr,
        year,
        decade: getDecade(year),
        month: getMonthName(month),
        gas_price_gallon: gasPrice,
        cpi_index: cpi,
        minimum_wage: minWage,
        movie_ticket_price: movieTicket,
        category: 'prices',
        searchable_text: `${year} ${getMonthName(month)} prices cost inflation economy`,
      })
    }
  }

  console.log(`Generated ${records.length} monthly price records\n`)

  // Initialize Algolia client
  console.log('Connecting to Algolia...')
  const client = algoliasearch(algoliaAppId, algoliaAdminKey)

  // Index records
  const INDEX_NAME = 'timeslip_prices'
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
      searchableAttributes: ['searchable_text', 'month'],
      attributesForFaceting: ['filterOnly(year)', 'filterOnly(decade)', 'filterOnly(date)', 'filterOnly(category)'],
      customRanking: ['desc(year)'],
    },
  })

  console.log('\nDone! FRED price data indexed successfully.')
  console.log(`Total records indexed: ${indexed}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
