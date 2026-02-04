#!/usr/bin/env node
/**
 * Create empty Algolia indices
 * Run this to initialize missing indices with proper settings
 */

import { config } from 'dotenv'
import { algoliasearch } from 'algoliasearch'

config({ path: '.env.local' })

const appId = process.env.ALGOLIA_APP_ID
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY

if (!appId || !adminKey) {
  console.error('Missing Algolia credentials')
  process.exit(1)
}

const client = algoliasearch(appId, adminKey)

async function createIndices() {
  const indices = [
    {
      name: 'timeslip_movies',
      settings: {
        searchableAttributes: ['title', 'overview'],
        attributesForFaceting: ['filterOnly(year)', 'filterOnly(decade)', 'filterOnly(date)', 'filterOnly(category)'],
        customRanking: ['desc(popularity)', 'desc(vote_average)'],
      }
    },
    {
      name: 'timeslip_prices',
      settings: {
        attributesForFaceting: ['filterOnly(year)', 'filterOnly(decade)', 'filterOnly(date)', 'filterOnly(category)'],
        customRanking: ['desc(date)'],
      }
    },
    {
      name: 'timeslip_events',
      settings: {
        searchableAttributes: ['title', 'description'],
        attributesForFaceting: ['filterOnly(year)', 'filterOnly(decade)', 'filterOnly(date)', 'filterOnly(category)', 'filterOnly(event_type)'],
        customRanking: ['desc(date)'],
      }
    },
  ]

  for (const index of indices) {
    console.log(`Creating ${index.name}...`)
    
    // Save a dummy object to create the index
    await client.saveObject({
      indexName: index.name,
      body: {
        objectID: 'placeholder',
        category: 'placeholder',
        date: 0,
        date_string: '1970-01-01',
        year: 1970,
        decade: '1970s',
      }
    })
    
    // Set index settings
    await client.setSettings({
      indexName: index.name,
      indexSettings: index.settings,
    })
    
    // Delete the placeholder
    await client.deleteObject({
      indexName: index.name,
      objectID: 'placeholder',
    })
    
    console.log(`✅ ${index.name} created`)
  }
  
  console.log('\n✨ All indices created successfully!')
}

createIndices().catch(console.error)
