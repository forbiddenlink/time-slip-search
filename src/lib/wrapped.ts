/**
 * Time Capsule Wrapped - Personal year-end style statistics
 * Tracks user exploration and generates shareable reports
 */

import type { SearchResults, Song, Movie } from './algolia'

export interface WrappedStats {
  userId: string
  totalSearches: number
  yearsExplored: number[]
  topDecade: string
  personality: 'explorer' | 'nostalgic' | 'curious' | 'historian' | 'specialist' | 'completionist'
  discoveries: {
    totalSongs: number
    totalMovies: number
    totalPrices: number
    favoriteSong?: Song
    favoriteMovie?: Movie
    rarestYear?: number
  }
  // Enhanced metrics
  decadeHeatMap: Record<string, number>  // e.g., "1980s": 15
  mostActiveMonth?: { month: string; count: number }
  longestSession?: { searches: number; date: string }
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

  // Update decade heat map
  const decade = `${Math.floor(year / 10) * 10}s`
  stats.decadeHeatMap = stats.decadeHeatMap || {}
  stats.decadeHeatMap[decade] = (stats.decadeHeatMap[decade] || 0) + 1

  // Track most active month
  const activity = getUserActivity()
  const monthCounts: Record<string, number> = {}
  activity.searches.forEach(s => {
    const month = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'long' })
    monthCounts[month] = (monthCounts[month] || 0) + 1
  })
  const topMonth = Object.entries(monthCounts).sort(([, a], [, b]) => b - a)[0]
  if (topMonth) {
    stats.mostActiveMonth = { month: topMonth[0], count: topMonth[1] }
  }

  // Track longest session (searches within 30 minutes of each other)
  const sessions = calculateSessions(activity.searches)
  const longest = sessions.sort((a, b) => b.count - a.count)[0]
  if (longest && (!stats.longestSession || longest.count > stats.longestSession.searches)) {
    stats.longestSession = { searches: longest.count, date: longest.date }
  }

  // Determine personality
  stats.personality = determinePersonality(stats)

  stats.lastExplored = new Date()

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

/**
 * Calculate sessions from search history
 */
function calculateSessions(searches: UserActivity['searches']): Array<{ count: number; date: string }> {
  if (searches.length === 0) return []

  const sessions: Array<{ count: number; date: string }> = []
  let currentSession = { count: 1, date: '' }
  let lastTime = searches[0]?.timestamp ? new Date(searches[0].timestamp).getTime() : 0

  currentSession.date = searches[0]?.timestamp
    ? new Date(searches[0].timestamp).toLocaleDateString()
    : ''

  for (let i = 1; i < searches.length; i++) {
    const searchTime = new Date(searches[i]!.timestamp).getTime()
    const gap = searchTime - lastTime

    // 30 minute gap = new session
    if (gap > 30 * 60 * 1000) {
      sessions.push(currentSession)
      currentSession = { count: 1, date: new Date(searches[i]!.timestamp).toLocaleDateString() }
    } else {
      currentSession.count++
    }

    lastTime = searchTime
  }

  sessions.push(currentSession)
  return sessions
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
    decadeHeatMap: {},
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
  if (stats.yearsExplored.length === 0) return 'curious'

  const yearSpread = Math.max(...stats.yearsExplored) - Math.min(...stats.yearsExplored)
  const searchesPerYear = stats.totalSearches / Math.max(stats.yearsExplored.length, 1)
  const uniqueDecades = new Set(stats.yearsExplored.map(y => Math.floor(y / 10) * 10)).size

  // Completionist: Exploring many unique years (collection behavior)
  if (stats.yearsExplored.length >= 20 && yearSpread > 40) {
    return 'completionist'
  }

  // Explorer: Wide range of years across many decades
  if (yearSpread > 30 && uniqueDecades >= 4) {
    return 'explorer'
  }

  // Specialist: Many searches focused on one decade
  const decadeCounts = Object.values(stats.decadeHeatMap || {})
  const maxDecadeCount = Math.max(...decadeCounts, 0)
  const totalDecadeSearches = decadeCounts.reduce((a, b) => a + b, 0)
  if (maxDecadeCount > 10 && maxDecadeCount / totalDecadeSearches > 0.6) {
    return 'specialist'
  }

  // Nostalgic: Focused on specific era with moderate exploration
  if (yearSpread < 15 && searchesPerYear > 2) {
    return 'nostalgic'
  }

  // Historian: Deep dives (many searches, broad exploration)
  if (stats.totalSearches > 20 && uniqueDecades >= 3) {
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
  const descriptions: Record<WrappedStats['personality'], { title: string; description: string; emoji: string }> = {
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
    specialist: {
      title: 'Decade Specialist',
      description: 'You know one era inside and out—a true expert of your favorite decade.',
      emoji: '🎯',
    },
    completionist: {
      title: 'Completionist',
      description: 'You\'re on a mission to explore every year. Collect them all!',
      emoji: '🏆',
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
 * Determine which decade emotionally resonates with the user
 */
export function determineEraAffinity(stats: WrappedStats): {
  decade: string
  reason: string
} {
  const { decadeHeatMap, topDecade } = stats

  if (!decadeHeatMap || Object.keys(decadeHeatMap).length === 0) {
    return {
      decade: topDecade || '1980s',
      reason: 'Start exploring to discover your era!'
    }
  }

  // Find the decade with most visits
  const entries = Object.entries(decadeHeatMap)
  const sorted = entries.sort(([, a], [, b]) => b - a)
  const [favDecade, count] = sorted[0] ?? [topDecade, 0]

  // Generate reason based on exploration depth
  let reason: string
  if (count >= 20) {
    reason = `You've visited the ${favDecade} ${count} times. This is your spiritual home.`
  } else if (count >= 10) {
    reason = `With ${count} visits, the ${favDecade} clearly speaks to your soul.`
  } else if (count >= 5) {
    reason = `You're drawn to the ${favDecade}. Something about this era resonates with you.`
  } else {
    reason = `The ${favDecade} is calling to you. Keep exploring to deepen the connection.`
  }

  return { decade: favDecade, reason }
}

/**
 * Reset wrapped stats (for testing)
 */
export function resetWrappedStats(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ACTIVITY_KEY)
}
