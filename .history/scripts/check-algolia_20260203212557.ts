import { algoliasearch } from 'algoliasearch'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env.local') })

async function checkAlgolia() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const searchKey = process.env.ALGOLIA_SEARCH_API_KEY

  console.log('🔍 Checking Algolia Configuration...\n')
  console.log('App ID:', appId ? `${appId.substring(0, 4)}...${appId.substring(appId.length - 4)}` : '❌ NOT SET')
  console.log('Search Key:', searchKey ? '✅ SET' : '❌ NOT SET')

  if (!appId || !searchKey) {
    console.error('\n❌ Missing credentials in .env.local')
    process.exit(1)
  }

  const client = algoliasearch(appId, searchKey)

  const indices = [
    'timeslip_songs',
    'timeslip_movies',
    'timeslip_prices',
    'timeslip_events',
  ]

  console.log('\n📊 Checking Indices...\n')

  for (const indexName of indices) {
    try {
      const response = await client.searchSingleIndex({
        indexName,
        searchParams: {
          query: '',
          hitsPerPage: 1,
        },
      })

      console.log(`✅ ${indexName}:`)
      console.log(`   - Total records: ${response.nbHits}`)
      
      if (response.hits.length > 0) {
        const sample = response.hits[0] as any
        console.log(`   - Sample date: ${sample.date_string || sample.date}`)
        if ('song_title' in sample) console.log(`   - Sample: "${sample.song_title}" by ${sample.artist}`)
        if ('title' in sample) console.log(`   - Sample: ${sample.title}`)
      }
    } catch (error) {
      console.error(`❌ ${indexName}: ${error instanceof Error ? error.message : 'Error'}`)
    }
  }

  console.log('\n🧪 Testing a sample query (March 15, 1987)...\n')

  // Test a specific date query
  const testDate = new Date('1987-03-15').getTime()
  const filters = `date >= ${testDate} AND date <= ${testDate + 86400000}`

  try {
    const response = await client.searchSingleIndex({
      indexName: 'timeslip_songs',
      searchParams: {
        query: '',
        filters,
        hitsPerPage: 5,
      },
    })

    console.log(`Found ${response.nbHits} songs for March 15, 1987:`)
    response.hits.forEach((hit: any) => {
      console.log(`  #${hit.chart_position}: "${hit.song_title}" by ${hit.artist}`)
    })
  } catch (error) {
    console.error('❌ Query failed:', error instanceof Error ? error.message : 'Error')
  }
}

checkAlgolia().catch(console.error)
