/**
 * Agent Memory System - localStorage-based persistence for AI agent
 * 
 * This implements the "Memory" component of Algolia's 2026 priority:
 * "The dynamic trio of retrieval, scale, and MEMORY"
 */

export interface SearchHistoryItem {
  id: string
  query: string
  dateDisplay: string
  year: number
  timestamp: number
  resultCount: number
}

export interface FavoriteDate {
  id: string
  query: string
  dateDisplay: string
  year: number
  topSong?: string
  topArtist?: string
  gasPrice?: number
  savedAt: number
  notes?: string
}

export interface UserPreferences {
  theme?: 'retro' | 'modern'
  autoPlayAnimations?: boolean
  defaultDecadeFilter?: string
  showInsights?: boolean
  recentSearchesCount?: number
}

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'timeslip_search_history',
  FAVORITES: 'timeslip_favorites',
  PREFERENCES: 'timeslip_preferences',
} as const

const MAX_HISTORY_ITEMS = 20
const MAX_FAVORITES = 50

/**
 * Search History Management
 */
export class SearchHistory {
  static getAll(): SearchHistoryItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load search history:', error)
      return []
    }
  }

  static add(item: Omit<SearchHistoryItem, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return

    try {
      const history = this.getAll()
      
      // Don't add duplicates of the same search within 5 minutes
      const recentDuplicate = history.find(
        h => h.query === item.query && Date.now() - h.timestamp < 5 * 60 * 1000
      )
      if (recentDuplicate) return

      const newItem: SearchHistoryItem = {
        ...item,
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }

      // Add to beginning, limit to MAX_HISTORY_ITEMS
      const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS)
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
  }

  static getRecent(count: number = 5): SearchHistoryItem[] {
    return this.getAll().slice(0, count)
  }
}

/**
 * Favorites Management
 */
export class Favorites {
  static getAll(): FavoriteDate[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load favorites:', error)
      return []
    }
  }

  static add(favorite: Omit<FavoriteDate, 'id' | 'savedAt'>): boolean {
    if (typeof window === 'undefined') return false

    try {
      const favorites = this.getAll()
      
      // Check if already favorited
      if (favorites.some(f => f.dateDisplay === favorite.dateDisplay)) {
        return false // Already exists
      }

      // Check max limit
      if (favorites.length >= MAX_FAVORITES) {
        throw new Error(`Maximum ${MAX_FAVORITES} favorites reached`)
      }

      const newFavorite: FavoriteDate = {
        ...favorite,
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        savedAt: Date.now(),
      }

      const updated = [newFavorite, ...favorites]
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated))
      return true
    } catch (error) {
      console.error('Failed to save favorite:', error)
      return false
    }
  }

  static remove(id: string): void {
    if (typeof window === 'undefined') return

    try {
      const favorites = this.getAll()
      const updated = favorites.filter(f => f.id !== id)
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  static isFavorited(dateDisplay: string): boolean {
    return this.getAll().some(f => f.dateDisplay === dateDisplay)
  }

  static toggle(favorite: Omit<FavoriteDate, 'id' | 'savedAt'>): boolean {
    const existing = this.getAll().find(f => f.dateDisplay === favorite.dateDisplay)
    
    if (existing) {
      this.remove(existing.id)
      return false // Removed
    } else {
      return this.add(favorite) // Added
    }
  }
}

/**
 * User Preferences Management
 */
export class Preferences {
  static get(): UserPreferences {
    if (typeof window === 'undefined') return {}
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Failed to load preferences:', error)
      return {}
    }
  }

  static set(preferences: Partial<UserPreferences>): void {
    if (typeof window === 'undefined') return

    try {
      const current = this.get()
      const updated = { ...current, ...preferences }
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES)
  }
}

/**
 * Analytics Helper - Track usage patterns
 */
export class AgentAnalytics {
  static getPopularDecades(): { decade: string; count: number }[] {
    const history = SearchHistory.getAll()
    const decadeCounts = new Map<string, number>()

    history.forEach(item => {
      const decade = `${Math.floor(item.year / 10) * 10}s`
      decadeCounts.set(decade, (decadeCounts.get(decade) || 0) + 1)
    })

    return Array.from(decadeCounts.entries())
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => b.count - a.count)
  }

  static getTotalSearches(): number {
    return SearchHistory.getAll().length
  }

  static getFavoriteCount(): number {
    return Favorites.getAll().length
  }

  static getEngagementScore(): number {
    const searches = this.getTotalSearches()
    const favorites = this.getFavoriteCount()
    
    // Simple engagement score: favorites/searches ratio
    if (searches === 0) return 0
    return Math.round((favorites / searches) * 100)
  }
}
