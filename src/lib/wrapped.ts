/**
 * Time Capsule Wrapped - Personal year-end style statistics
 * Tracks user exploration and generates shareable reports
 */

import { SearchResults, Song, Movie } from './algolia'

export interface WrappedStats {
  userId: string
  totalSearches: number
  yearsExplored: number[]
  topDecade: string
  personality: 'explorer' | 'nostalgic' | 'curious' | 'historian'
  discoveries: {
    totalSongs: number
    totalMovies: number
    totalPrices: number
    favoriteSong?: Song
    favoriteMovie?: Movie
    rarestYear?: number
  }
  explorationStarted: Date
  lastExplored: Date
}

export interface UserActivity {
  searches: {
    query: string
    year: number
    timestamp: Date
    results: {
      songs: number
      movies: number
      prices: number
    }
  }[]
}

const STORAGE_KEY = 'timeslip_wrapped_stats'
const ACTIVITY_KEY = 'timeslip_activity'

/**
 * Track a search in user activity
 */
export function trackSearch(
  query: string,
  year: number,
  results: SearchResults
): void {
  if (typeof window === 'undefined') return

  const activity = getUserActivity()
  activity.searches.push({
    query,
    year,
    timestamp: new Date(),
    results: {
      songs: results.songs.length,
      movies: results.movies.length,
      prices: results.prices.length,
    },
  })

  // Keep last 100 searches
  if (activity.searches.length > 100) {
    activity.searches = activity.searches.slice(-100)
  }

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity))
  updateWrappedStats(year, results)
}

/**
 * Get user activity from storage
 */
function getUserActivity(): UserActivity {
  if (typeof window === 'undefined') {
    return { searches: [] }
  }

  const stored = localStorage.getItem(ACTIVITY_KEY)
  if (!stored) {
    return { searches: [] }
  }

  try {
    const data = JSON.parse(stored)
    // Convert timestamp strings back to Dates
    data.searches = data.searches.map((s: any) => ({
      ...s,
      timestamp: new Date(s.timestamp),
    }))
    return data
  } catch {
    return { searches: [] }
  }
}

/**
 * Update wrapped stats after each search
 */
function updateWrappedStats(year: number, results: SearchResults): void {
  const stats = getWrappedStats()

  stats.totalSearches++
  if (!stats.yearsExplored.includes(year)) {
    stats.yearsExplored.push(year)
  }

  stats.discoveries.totalSongs += results.songs.length
  stats.discoveries.totalMovies += results.movies.length
  stats.discoveries.totalPrices += results.prices.length

  // Update favorite song (most common artist)
  if (results.songs[0]) {
    stats.discoveries.favoriteSong = results.songs[0]
  }

  // Update favorite movie (highest rated)
  if (results.movies[0]) {
    stats.discoveries.favoriteMovie = results.movies[0]
  }

  // Calculate top decade
  stats.topDecade = calculateTopDecade(stats.yearsExplored)

  // Determine personality
  stats.personality = determinePersonality(stats)

  stats.lastExplored = new Date()

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

/**
 * Get current wrapped stats
 */
export function getWrappedStats(): WrappedStats {
  if (typeof window === 'undefined') {
    return createEmptyStats()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return createEmptyStats()
  }

  try {
    const data = JSON.parse(stored)
    data.explorationStarted = new Date(data.explorationStarted)
    data.lastExplored = new Date(data.lastExplored)
    return data
  } catch {
    return createEmptyStats()
  }
}

/**
 * Create empty stats for new users
 */
function createEmptyStats(): WrappedStats {
  return {
    userId: generateUserId(),
    totalSearches: 0,
    yearsExplored: [],
    topDecade: '1960s',
    personality: 'curious',
    discoveries: {
      totalSongs: 0,
      totalMovies: 0,
      totalPrices: 0,
    },
    explorationStarted: new Date(),
    lastExplored: new Date(),
  }
}

/**
 * Calculate most explored decade
 */
function calculateTopDecade(years: number[]): string {
  if (years.length === 0) return '1960s'

  const decades = years.map((y) => Math.floor(y / 10) * 10)
  const counts: Record<number, number> = {}

  decades.forEach((d) => {
    counts[d] = (counts[d] || 0) + 1
  })

  const topDecade = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0]
  return topDecade ? `${topDecade}s` : '1960s'
}

/**
 * Determine user personality based on exploration patterns
 */
function determinePersonality(stats: WrappedStats): WrappedStats['personality'] {
  const yearSpread = Math.max(...stats.yearsExplored) - Math.min(...stats.yearsExplored)
  const searchesPerYear = stats.totalSearches / Math.max(stats.yearsExplored.length, 1)

  // Explorer: Wide range of years
  if (yearSpread > 30 && stats.yearsExplored.length > 10) {
    return 'explorer'
  }

  // Nostalgic: Focused on specific era
  if (yearSpread < 15 && searchesPerYear > 2) {
    return 'nostalgic'
  }

  // Historian: Deep dives (many searches)
  if (stats.totalSearches > 20) {
    return 'historian'
  }

  return 'curious'
}

/**
 * Generate unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get personality description
 */
export function getPersonalityDescription(personality: WrappedStats['personality']): {
  title: string
  description: string
  emoji: string
} {
  const descriptions = {
    explorer: {
      title: 'Time Explorer',
      description: 'You love discovering different eras and jumping between decades!',
      emoji: '🚀',
    },
    nostalgic: {
      title: 'Nostalgic Soul',
      description: 'You have a favorite era and love diving deep into its culture.',
      emoji: '💫',
    },
    curious: {
      title: 'Curious Traveler',
      description: "You're just starting your journey through time!",
      emoji: '🔍',
    },
    historian: {
      title: 'History Buff',
      description: 'You explore extensively and love learning about the past.',
      emoji: '📚',
    },
  }

  return descriptions[personality]
}

/**
 * Check if user has enough activity for wrapped
 */
export function hasEnoughActivity(): boolean {
  const stats = getWrappedStats()
  return stats.totalSearches >= 3
}

/**
 * Reset wrapped stats (for testing)
 */
export function resetWrappedStats(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ACTIVITY_KEY)
}
